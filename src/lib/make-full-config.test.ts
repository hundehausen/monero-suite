import { describe, expect, it } from "vitest";
import { z } from "zod";
import { fullConfigSchema } from "./config-schema";
import { makeFullConfig } from "./make-full-config";

describe("makeFullConfig", () => {
  it("returns a schema-valid default config", () => {
    expect(fullConfigSchema.validate(makeFullConfig())).toBe(true);
  });

  it("defaults upgradeSystemPackages to off", () => {
    expect(makeFullConfig().upgradeSystemPackages).toBe(false);
  });

  it("z.compile of fullConfigSchema still accepts defaults and rejects collisions", () => {
    const compiled = z.compile(fullConfigSchema);
    expect(compiled.parse(makeFullConfig())).toEqual(fullConfigSchema.parse(makeFullConfig()));
    expect(
      compiled.safeParse(makeFullConfig({ monerod: { p2pBindPort: "18081" } })).success
    ).toBe(false);
  });

  it("defaults banList to the path the sethforprivacy image ships", () => {
    expect(makeFullConfig().monerod.banList).toBe("/home/monero/ban_list.txt");
  });

  it("deep-merges a services override without dropping the rest of the group", () => {
    const config = makeFullConfig({ services: { isXmrigProxy: true } });
    expect(config.services.isXmrigProxy).toBe(true);
    expect(config.services.isMonitoring).toBe(false);
    expect(config.services.grafanaDomain).toBe("grafana.example.com");
    expect(config.services.grafanaAdminPassword).toBe("admin");
    expect(config.services.walletRpcPassword).toBe("changeme");
    expect(config.monerod.p2pBindPort).toBe("18080");
  });

  it("applies stacked overrides left to right", () => {
    const config = makeFullConfig(
      { services: { isMonitoring: true, isCuprateEnabled: true } },
      { services: { isCuprateEnabled: false } }
    );
    expect(config.services.isMonitoring).toBe(true);
    expect(config.services.isCuprateEnabled).toBe(false);
  });
});
