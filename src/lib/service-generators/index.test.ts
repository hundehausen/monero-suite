import { describe, expect, it } from "vitest";
import {
  anyHiddenService,
  generateAllServices,
} from "./index";
import { makeFullConfig } from "@/lib/make-full-config";
import { generateBashScriptFile } from "@/app/utils";

describe("anyHiddenService", () => {
  it("is false when every hidden-service flag is off", () => {
    expect(anyHiddenService(makeFullConfig().tor)).toBe(false);
  });

  it("is true when only hsMonerod is on", () => {
    expect(anyHiddenService(makeFullConfig({ tor: { hsMonerod: true } }).tor)).toBe(true);
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
