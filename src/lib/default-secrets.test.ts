import { describe, expect, it } from "vitest";
import { getDefaultSecretWarnings } from "./default-secrets";
import { makeFullConfig } from "./make-full-config";

describe("getDefaultSecretWarnings", () => {
  it("is silent when monitoring and wallet-rpc are off", () => {
    expect(getDefaultSecretWarnings(makeFullConfig())).toEqual([]);
  });

  it("warns when Grafana is on and the password is still admin", () => {
    const warnings = getDefaultSecretWarnings(
      makeFullConfig({ services: { isMonitoring: true } })
    );
    expect(warnings).toEqual([
      expect.objectContaining({
        path: "services.grafanaAdminPassword",
        section: "monitoring",
      }),
    ]);
  });

  it("does not warn after the Grafana password is changed", () => {
    expect(
      getDefaultSecretWarnings(
        makeFullConfig({
          services: { isMonitoring: true, grafanaAdminPassword: "not-admin" },
        })
      )
    ).toEqual([]);
  });

  it("warns when wallet-rpc is on and the password is still changeme", () => {
    const warnings = getDefaultSecretWarnings(
      makeFullConfig({ services: { isMoneroWalletRpc: true } })
    );
    expect(warnings).toEqual([
      expect.objectContaining({
        path: "services.walletRpcPassword",
        section: "monero-wallet-rpc",
      }),
    ]);
  });

  it("does not warn after the wallet-rpc password is changed", () => {
    expect(
      getDefaultSecretWarnings(
        makeFullConfig({
          services: {
            isMoneroWalletRpc: true,
            walletRpcPassword: "not-changeme",
          },
        })
      )
    ).toEqual([]);
  });
});
