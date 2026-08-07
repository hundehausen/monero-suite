import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const e2eDir = path.join(__dirname);
const artifactsDir = path.join(e2eDir, "artifacts");

/**
 * Deterministic minimal config — every toggle set explicitly so the run
 * does not depend on future default changes. Traefik off so example.com
 * domains do not block the install panel (hasDefaultDomain).
 */
const CANNED_URL =
  "/?architecture=linux%2Famd64" +
  "&networkMode=local" +
  "&isMoneroPublicNode=false" +
  "&moneroNodeDomain=node.example.com" +
  "&moneroNodeNoLogs=true" +
  "&offlineMode=true" +
  "&isStagenetNode=false" +
  "&isCuprateEnabled=false" +
  "&isMoneroWalletRpc=false" +
  "&isTraefik=false" +
  "&isMonitoring=false" +
  "&isWatchtower=false" +
  "&isPortainer=false" +
  "&p2PoolMode=none" +
  "&miningMode=none" +
  "&torProxyMode=none";

function shouldRunContainer(): boolean {
  if (process.env.E2E_RUN_CONTAINER === "0") return false;
  if (process.env.E2E_RUN_CONTAINER === "1") return true;
  return process.env.CI === "true";
}

test.describe("install artifact e2e", () => {
  // Stages share artifacts on disk; run in order and stop on first failure.
  test.describe.configure({ mode: "serial" });

  test.beforeAll(() => {
    fs.mkdirSync(artifactsDir, { recursive: true });
  });

  test("downloads docker-compose.yml and install.sh from canned URL", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto(CANNED_URL);
    await expect(
      page.getByRole("tab", { name: /Docker Compose/i }),
    ).toBeVisible({ timeout: 30_000 });

    // Default tab is docker-compose — download compose file.
    const composeDownloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download docker-compose.yml" })
      .click();
    const composeDownload = await composeDownloadPromise;
    const composePath = path.join(artifactsDir, "docker-compose.yml");
    await composeDownload.saveAs(composePath);

    // Install script lives on its own tab.
    await page.getByRole("tab", { name: /Install Script/i }).click();
    await expect(
      page.getByRole("button", { name: "Download install.sh" }),
    ).toBeEnabled({ timeout: 15_000 });

    const installDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download install.sh" }).click();
    const installDownload = await installDownloadPromise;
    const installPath = path.join(artifactsDir, "install.sh");
    await installDownload.saveAs(installPath);

    expect(fs.existsSync(composePath)).toBe(true);
    expect(fs.existsSync(installPath)).toBe(true);
    expect(fs.statSync(composePath).size).toBeGreaterThan(0);
    expect(fs.statSync(installPath).size).toBeGreaterThan(0);

    // Sanity: compose is embedded; monerod is always required; offline avoids mainnet sync.
    // (MONERO_ENV_EOF only appears when a service contributes env vars, e.g. monitoring.)
    const installContents = fs.readFileSync(installPath, "utf8");
    expect(installContents).toContain("MONERO_COMPOSE_EOF");
    expect(installContents).toContain("monerod");
    expect(installContents).toContain("--offline");
    expect(installContents).toContain("docker compose up -d");
  });

  test("static validation of downloaded artifacts", async () => {
    const composePath = path.join(artifactsDir, "docker-compose.yml");
    const installPath = path.join(artifactsDir, "install.sh");

    expect(fs.existsSync(composePath)).toBe(true);
    expect(fs.existsSync(installPath)).toBe(true);

    const bashN = spawnSync("bash", ["-n", installPath], { encoding: "utf8" });
    expect(bashN.status, bashN.stderr || bashN.stdout).toBe(0);

    const dockerAvailable =
      spawnSync("docker", ["compose", "version"], { encoding: "utf8" })
        .status === 0;
    if (!dockerAvailable && process.env.CI !== "true") {
      console.warn(
        "docker compose not available — skipping compose config validation",
      );
    } else {
      const composeConfig = spawnSync(
        "docker",
        ["compose", "-f", composePath, "config", "--quiet"],
        { encoding: "utf8" },
      );
      expect(
        composeConfig.status,
        composeConfig.stderr || composeConfig.stdout,
      ).toBe(0);
    }

    // Soft shellcheck when available.
    const shellcheck = spawnSync("shellcheck", ["--version"], {
      encoding: "utf8",
    });
    if (shellcheck.status === 0) {
      const sc = spawnSync("shellcheck", ["-S", "warning", installPath], {
        encoding: "utf8",
      });
      if (sc.status !== 0) {
        console.warn(
          "shellcheck warnings (non-fatal):\n",
          sc.stdout || sc.stderr,
        );
      }
    }
  });

  test("run install.sh in systemd container", async () => {
    test.skip(
      !shouldRunContainer(),
      "Set E2E_RUN_CONTAINER=1 (or CI=true) to run the container stage",
    );
    test.setTimeout(25 * 60 * 1000);

    const script = path.join(e2eDir, "run-in-container.sh");
    const result = spawnSync("bash", [script], {
      encoding: "utf8",
      cwd: e2eDir,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);

    expect(result.status, "run-in-container.sh failed").toBe(0);
  });
});
