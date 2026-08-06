# E2E: Execute the Generated Artifact (install.sh) in CI

**Date:** 2026-08-06
**Status:** Approved design (pending spec review)

## Problem

The app generates a `docker-compose.yml` and an `install.sh` that installs Docker,
writes the compose stack, and boots a Monero node stack on a fresh Linux server.
Unit tests cover the generators, but nothing proves that what the UI presents —
reachable through a shareable nuqs URL — actually *works* when executed on a clean
Debian box. CI currently runs lint + build only.

## Goal

An end-to-end CI pipeline that:

1. Opens the app in Playwright at a canned nuqs-parameterized URL.
2. Copies the `docker-compose.yml` and `install.sh` out of the UI (via the app's
   own download buttons).
3. Validates both artifacts statically.
4. Runs `install.sh` inside a privileged Debian container with systemd as PID 1,
   asserts the stack reaches live containers, then tears down to stop the
   (impossible-to-complete) mainnet blockchain sync.

## Approach

**Single GitHub Actions job (Approach A).** One `ubuntu-latest` job runs the whole
pipeline sequentially: build → Playwright extract → static validation → container
run → teardown → upload artifacts on failure.

Rejected alternatives: two jobs with artifact handoff (more wiring, not needed for
one scenario); prebaked Docker+systemd image (skips the Docker-install path the
script exists to test); real QEMU/KVM VM (slow, no KVM on GH-hosted runners).

## Components

### Files

| File | Purpose |
|---|---|
| `.github/workflows/e2e.yml` | The single CI job |
| `e2e/playwright.config.ts` | Playwright config (testDir `e2e`, webServer `pnpm start`, chromium only) |
| `e2e/install.e2e.spec.ts` | Playwright spec: open URL, click both download buttons, capture files |
| `e2e/run-in-container.sh` | Build systemd image, run container, exec install.sh, poll, teardown |
| `e2e/Dockerfile.systemd` | Debian image with systemd as PID 1 (base for the run step) |
| `e2e/artifacts/` | Output dir: `install.sh`, `docker-compose.yml`, run log (gitignored) |
| `docs/superpowers/specs/2026-08-06-e2e-execute-artifact-design.md` | This spec |

New dev dependencies: `@playwright/test`.

Repo-config caveats (handled during implementation):

- `tsconfig.json` includes `**/*.ts`, so `e2e/*.ts` will be typechecked by `next build`/`pnpm lint`. The e2e files must be type-clean (Playwright types come from `@playwright/test`) and stay inside `eslint.config.mjs` scope; alternatively `e2e` can be excluded from lint if it fights the Next config.
- `e2e/artifacts/` must be added to `.gitignore`; build output in CI writes there. `next build` must not treat it as app code (it's outside `src/`, fine).
- The `pnpm start` webServer needs a prior `pnpm build`; CI order: build → playwright extract → container run.

### Canned URL (deterministic minimal config)

Constructed from the app's actual nuqs param names (verified in source), explicitly
setting every toggle so the result is independent of future default changes:

```
/?architecture=linux/amd64
 &networkMode=local
 &isMoneroPublicNode=false
 &moneroNodeDomain=node.example.com
 &moneroNodeNoLogs=true
 &isStagenetNode=false
 &isCuprateEnabled=false
 &isMoneroWalletRpc=false
 &isTraefik=false
 &isMonitoring=false
 &isWatchtower=false
 &isPortainer=false
 &p2PoolMode=none
 &miningMode=none
 &torProxyMode=none
```

Notes:

- `moneroNodeDomain=node.example.com` is kept intentionally: `hasDefaultDomain`
  (src/hooks/services-context.tsx:158) only blocks when Traefik is on, so the
  install panel is fully usable while proving the "default domain" case does not
  block a local-mode install.
- `monerod` is always `checked: true` (src/lib/service-generators/monerod.ts:277),
  so the stack always contains the one mandatory container — exactly what we want
  to prove boots.
- `moneroNodeNoLogs=true` reduces container log churn during the run.

### Stage 2 — Playwright extraction (`install.e2e.spec.ts`)

- Serve the app with `pnpm start` (production build; `webServer` in Playwright
  config, `reuseExistingServer: !process.env.CI`).
- `page.goto(cannedUrl)`; wait for the tabs to render.
- Click `Download docker-compose.yml` (ComposePreview) and `Download install.sh`
  (InstallScriptPanel) using `page.waitForEvent("download")` +
  `download.saveAs()` into `e2e/artifacts/`.
- Assert both files exist and are non-empty.
- Download buttons use client-side Blob + `a.download` (verified in source), so no
  Vercel Blob credentials are needed in CI.

### Stage 3 — Static validation

- `bash -n artifacts/install.sh` — syntax check.
- `docker compose config --quiet artifacts/docker-compose.yml` — canonical compose
  spec validation, works offline, no daemon required.
- Assert script contains the `.env` heredoc block (sanity that env generation is
  embedded).
- Optionally `shellcheck` if available on runner (soft-fail).

### Stage 4 — Container run (`run-in-container.sh`)

Base image (swap-prone, default `debian:trixie`, Debian 13 current stable; Ubuntu
also acceptable):

```dockerfile
FROM debian:trixie
RUN apt-get update && apt-get install -y systemd systemd-sysv ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
CMD ["/sbin/init"]
```

Steps:

1. Build image: `docker build -t monero-suite-e2e:local -f e2e/Dockerfile.systemd .`
2. Run: `docker run -d --name e2e-installer --privileged --cgroupns=host
   -v /sys/fs/cgroup:/sys/fs/cgroup:rw monero-suite-e2e:local`
3. Wait for systemd (bounded poll on `systemctl is-system-running`).
4. `docker cp artifacts/install.sh e2e-installer:/root/install.sh`
5. `docker exec e2e-installer bash /root/install.sh --verbose` (streams output to
   `e2e/artifacts/install-run.log`).
6. Poll `docker exec e2e-installer docker compose -f
   /root/monero-suite/docker-compose.yml ps` until monerod shows `running`
   (12 × 10s bounded); treat `restarting`/`exited` as immediate failure.
7. RPC probe (stronger success signal): `docker exec e2e-installer bash -c
   'curl -sf http://127.0.0.1:18081/get_version'` returns JSON.
8. Teardown (always runs): `docker compose down` then `docker rm -f
   e2e-installer` to stop the mainnet sync.

Because the container has no Docker preinstalled, the script exercises its full
server path: `pkg_update` → install `curl` → `get.docker.com` → Docker install →
`systemctl enable --now docker` (real systemd PID 1) → writes
`~/monero-suite/{docker-compose.yml,.env}` → `docker compose pull` → `docker
compose up -d`.

No `ufw` present → script takes the safe "no supported firewall found" warn-and-
continue branch (src/lib/bash-templates.ts:200), which is desired coverage.

### Error handling

- Any failed stage → non-zero exit → `actions/upload-artifact` uploads
  `e2e/artifacts/` (install.sh, compose, install-run.log, `docker logs` dump).
- Job `timeout-minutes: 30` (image pulls + Docker self-install are the long pole).
- Polls are bounded; no hangs.
- Teardown in a `trap`/`always()` so the container never leaks into the next run.

### Verification

- Locally: `E2E_RUN_CONTAINER=0 pnpm exec playwright test` runs only the web
  extract part; `E2E_RUN_CONTAINER=1` (or CI) includes the container step.
- CI: full four-stage pipeline on push to `main` and PRs (mirrors existing
  `ci.yml` triggers).

## Risks / mitigations

| Risk | Mitigation |
|---|---|
| ghcr.io image pulls slow/rate-limited | `docker compose pull` is `nofail`; retry loop in runner script |
| systemd-in-container flakiness | pinned base image, bounded `is-system-running` poll |
| Mainnet sync writes gigabytes | Immediate `docker compose down` after assertion; named volumes only |
| Example.com domain blocks UI | Traefik off → `hasDefaultDomain` false (verified in source) |
| Browser install cost | `playwright install --with-deps chromium` cached via GH Actions |
