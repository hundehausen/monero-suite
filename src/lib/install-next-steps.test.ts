import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { makeFullConfig } from "./make-full-config";
import { generateInstallationScript } from "./script-generator";
import {
  bashSingleQuote,
  FULL_NODE_DISK_GB,
  installScriptHintsFromConfig,
  PRUNED_NODE_DISK_GB,
  renderAccessUrlEchoes,
  renderSecretWarningEchoes,
} from "./install-next-steps";

describe("installScriptHintsFromConfig", () => {
  it("always includes restricted RPC on localhost for a local stack", () => {
    const hints = installScriptHintsFromConfig(makeFullConfig());
    expect(hints.accessLines).toEqual([
      {
        label: "Monero restricted RPC",
        url: "http://localhost:18089",
      },
    ]);
    expect(hints.hasHiddenServices).toBe(false);
    expect(hints.offlineMode).toBe(false);
    expect(hints.isPrunedNode).toBe(false);
    expect(hints.blockchainPath).toBe("");
    expect(hints.secretWarnings).toEqual([]);
  });

  it("binds exposed private RPC to 127.0.0.1 and uses Traefik URLs when domains are real", () => {
    const hints = installScriptHintsFromConfig(
      makeFullConfig({
        networkMode: "exposed",
        services: {
          isMonitoring: true,
          isTraefik: true,
          isTraefikGrafana: true,
          grafanaDomain: "monitor.example.org",
          grafanaAdminPassword: "not-admin",
        },
      })
    );
    expect(hints.accessLines).toContainEqual({
      label: "Monero restricted RPC",
      url: "http://127.0.0.1:18089",
    });
    expect(hints.accessLines).toContainEqual({
      label: "Grafana",
      url: "https://monitor.example.org",
    });
  });

  it("falls back to a local Grafana URL when the domain is still example.com", () => {
    const hints = installScriptHintsFromConfig(
      makeFullConfig({
        services: {
          isMonitoring: true,
          isTraefik: true,
          isTraefikGrafana: true,
          grafanaDomain: "monitor.example.com",
          grafanaAdminPassword: "not-admin",
        },
      })
    );
    expect(hints.accessLines).toContainEqual({
      label: "Grafana",
      url: "http://localhost:3000",
    });
  });

  it("forwards secrets, prune, custom chain path, onions, and offline", () => {
    const hints = installScriptHintsFromConfig(
      makeFullConfig({
        monerod: {
          isPrunedNode: true,
          isMoneroMainnetVolume: false,
          moneroMainnetBlockchainLocation: "/mnt/data/monero",
          offlineMode: true,
        },
        tor: { hsMonerod: true },
        services: { isMonitoring: true },
      })
    );
    expect(hints.isPrunedNode).toBe(true);
    expect(hints.blockchainPath).toBe("/mnt/data/monero");
    expect(hints.hasHiddenServices).toBe(true);
    expect(hints.offlineMode).toBe(true);
    expect(hints.secretWarnings.length).toBeGreaterThan(0);
  });

  it("lists P2Pool, wallet RPC, Portainer, LWS, and Cuprate when they are on", () => {
    const hints = installScriptHintsFromConfig(
      makeFullConfig({
        p2pool: { p2PoolMode: "mini", p2PoolPayoutAddress: "4" + "A".repeat(94) },
        services: {
          isMoneroWalletRpc: true,
          walletRpcPassword: "not-changeme",
          isPortainer: true,
          isMoneroLws: true,
          isCuprateEnabled: true,
        },
      })
    );
    const labels = hints.accessLines.map((line) => line.label);
    expect(labels).toContain("P2Pool stratum");
    expect(labels).toContain("Wallet RPC");
    expect(labels).toContain("Portainer");
    expect(labels).toContain("Light wallet server");
    expect(labels).toContain("LWS admin API");
    expect(labels).toContain("Cuprate RPC");
  });
});

describe("bash rendering", () => {
  it("single-quotes values that contain apostrophes", () => {
    expect(bashSingleQuote("it's")).toBe(`'it'\\''s'`);
  });

  it("emits printf lines for access URLs", () => {
    const bash = renderAccessUrlEchoes([
      { label: "Grafana", url: "http://localhost:3000" },
    ]);
    expect(bash).toContain("printf '  %s  %s\\n' 'Grafana' 'http://localhost:3000'");
  });

  it("emits yellow secret warnings", () => {
    const bash = renderSecretWarningEchoes(["do not use admin"]);
    expect(bash).toContain("'do not use admin'");
    expect(bash).toContain("${YELLOW}");
  });
});

describe("generateInstallationScript hints", () => {
  it("embeds URLs, disk constants, and next-step helpers", () => {
    const hints = installScriptHintsFromConfig(
      makeFullConfig({
        services: { isMonitoring: true, grafanaAdminPassword: "not-admin" },
        monerod: { isPrunedNode: true, offlineMode: true },
        tor: { hsGrafana: true },
      })
    );
    const script = generateInstallationScript(
      "services: {}\n",
      "",
      undefined,
      false,
      "",
      false,
      hints
    );
    expect(script).toContain("http://localhost:18089");
    expect(script).toContain("http://localhost:3000");
    expect(script).toContain("HAS_HIDDEN_SERVICES=\"true\"");
    expect(script).toContain("OFFLINE_MODE=\"true\"");
    expect(script).toContain("IS_PRUNED_NODE=\"true\"");
    expect(script).toContain(`PRUNED_DISK_GB="${PRUNED_NODE_DISK_GB}"`);
    expect(script).toContain(`FULL_DISK_GB="${FULL_NODE_DISK_GB}"`);
    expect(script).toContain("confirm_overwrite_install_dir");
    expect(script).toContain("warn_disk_space");
    expect(script).toContain("start_sudo_keepalive");
    expect(script).toContain("dump_cmd_log");
    expect(script).toContain("This node is in offline mode");
    expect(script).not.toContain("__ACCESS_URLS__");
    expect(script).not.toContain("__SECRET_WARNINGS__");

    const bashN = spawnSync("bash", ["-n"], { input: script, encoding: "utf8" });
    expect(bashN.status, bashN.stderr || bashN.stdout).toBe(0);
  });
});
