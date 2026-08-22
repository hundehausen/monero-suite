import { describe, expect, it } from "vitest";
import { fullConfigSchema } from "./config-schema";
import { makeFullConfig } from "./make-full-config";

describe("makeFullConfig", () => {
  it("returns a schema-valid default config", () => {
    expect(fullConfigSchema.safeParse(makeFullConfig()).success).toBe(true);
  });

  it("deep-merges a services override without dropping the rest of the group", () => {
    const config = makeFullConfig({ services: { isXmrigProxy: true } });
    expect(config.services.isXmrigProxy).toBe(true);
    expect(config.services.isMonitoring).toBe(false);
    expect(config.services.grafanaDomain).toBe("grafana.example.com");
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
