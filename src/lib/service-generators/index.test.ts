import { describe, expect, it } from "vitest";
import {
  anyHiddenService,
  generateAllServices,
} from "./index";
import { makeFullConfig } from "@/lib/make-full-config";
import { generateBashScriptFile } from "@/app/utils";

describe("anyHiddenService", () => {
  it("is false when every hidden-service flag is off", () => {
    const config = makeFullConfig();
    expect(anyHiddenService(config.tor, config.p2pool.p2PoolMode)).toBe(false);
  });

  it("is true when only hsMonerod is on", () => {
    const config = makeFullConfig({ tor: { hsMonerod: true } });
    expect(anyHiddenService(config.tor, config.p2pool.p2PoolMode)).toBe(true);
  });

  it("ignores hsP2Pool when P2Pool mode is none", () => {
    const config = makeFullConfig({ tor: { hsP2Pool: true } });
    expect(config.p2pool.p2PoolMode).toBe("none");
    expect(anyHiddenService(config.tor, config.p2pool.p2PoolMode)).toBe(false);
  });

  it("counts hsP2Pool when a P2Pool sidechain is selected", () => {
    const config = makeFullConfig({
      tor: { hsP2Pool: true },
      p2pool: { p2PoolMode: "mini" },
    });
    expect(anyHiddenService(config.tor, config.p2pool.p2PoolMode)).toBe(true);
  });
});

describe("generateAllServices hidden services", () => {
  it("adds --disable-rpc-ban when a hidden service is on", () => {
    const services = generateAllServices(
      makeFullConfig({
        tor: { hsMonerod: true },
      })
    );
    const command = services.monerod.code.monerod?.command as string[];
    expect(command).toContain("--disable-rpc-ban");
  });

  it("does not enable Tor or disable RPC bans for a stale P2Pool onion flag", () => {
    const services = generateAllServices(
      makeFullConfig({
        tor: { hsP2Pool: true },
      })
    );
    const command = services.monerod.code.monerod?.command as string[];
    expect(command).not.toContain("--disable-rpc-ban");
    expect(services.tor.checked).toBe(false);
  });
});

describe("generateAllServices bash setup", () => {
  it("attaches monitoring and cuprate bash so preview and upload share one source", () => {
    const checked = Object.values(
      generateAllServices(
        makeFullConfig({
          services: { isMonitoring: true, isCuprateEnabled: true },
        })
      )
    ).filter((service) => service.checked !== false && service.checked !== "none");
    const bash = generateBashScriptFile(checked);
    expect(bash).toContain("Set up monitoring configuration");
    expect(bash).toContain("Set up Cuprate configuration");
  });

  it("omits bash for unchecked monitoring and cuprate", () => {
    const checked = Object.values(generateAllServices(makeFullConfig())).filter(
      (service) => service.checked !== false && service.checked !== "none"
    );
    expect(generateBashScriptFile(checked)).toBe("");
  });
});
