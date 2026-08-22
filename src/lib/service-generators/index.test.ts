import { describe, expect, it } from "vitest";
import { p2poolModes } from "@/lib/service-types";
import {
  anyHiddenService,
  filterServicesByArchitecture,
  generateAllServices,
} from "./index";
import { makeFullConfig } from "@/lib/make-full-config";
import { generateBashScriptFile } from "@/app/utils";

const VALID_ADDRESS = `4${"1".repeat(94)}`;

describe("anyHiddenService", () => {
  it("is false when every hidden-service flag is off", () => {
    expect(anyHiddenService(makeFullConfig().tor)).toBe(false);
  });

  it("is true when only hsXmrigProxy is on", () => {
    expect(anyHiddenService(makeFullConfig({ tor: { hsXmrigProxy: true } }).tor)).toBe(true);
  });
});

describe("generateAllServices ban-list", () => {
  const imageBanListFlag = "--ban-list=/home/monero/ban_list.txt";

  it("sets the image ban list on the default monerod command", () => {
    const command = generateAllServices(makeFullConfig()).monerod.code.monerod
      ?.command as string[];
    expect(command).toContain(imageBanListFlag);
  });

  it("sets the image ban list on stagenet, which always uses a custom command", () => {
    const command = generateAllServices(
      makeFullConfig({ stagenet: { isStagenetNode: true } })
    )["monerod-stagenet"].code["monerod-stagenet"]?.command as string[];
    expect(command).toContain(imageBanListFlag);
  });
});

describe("generateAllServices hidden services", () => {
  it("adds --disable-rpc-ban when only the xmrig-proxy hidden service is on", () => {
    const services = generateAllServices(
      makeFullConfig({
        tor: { hsXmrigProxy: true },
      })
    );
    const command = services.monerod.code.monerod?.command as string[];
    expect(command).toContain("--disable-rpc-ban");
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

describe("filterServicesByArchitecture", () => {
  const proxyOn = makeFullConfig({
    p2pool: {
      p2PoolMode: p2poolModes.full,
      p2PoolPayoutAddress: VALID_ADDRESS,
      p2PoolMiningThreads: 4,
    },
    services: { isXmrigProxy: true },
  });

  it("drops xmrig-proxy on arm64", () => {
    const filtered = filterServicesByArchitecture(
      generateAllServices({ ...proxyOn, architecture: "linux/arm64" }),
      "linux/arm64"
    );
    expect(filtered["xmrig-proxy"]).toBeUndefined();
  });

  it("keeps xmrig-proxy on amd64 when the proxy is enabled", () => {
    const filtered = filterServicesByArchitecture(
      generateAllServices(proxyOn),
      "linux/amd64"
    );
    expect(filtered["xmrig-proxy"]).toBeDefined();
    expect(filtered["xmrig-proxy"].checked).toBe(true);
  });
});
