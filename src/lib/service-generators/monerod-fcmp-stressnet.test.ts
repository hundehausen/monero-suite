import { describe, expect, it } from "vitest";
import { createMonerodFcmpStressnetService } from "./monerod-fcmp-stressnet";
import { generateAllServices } from "./index";
import { networkModes } from "@/lib/service-types";
import { makeFullConfig } from "@/lib/make-full-config";
import { installScriptHintsFromConfig } from "@/lib/install-next-steps";

const container = (config: ReturnType<typeof makeFullConfig>) =>
  createMonerodFcmpStressnetService(config).code["monerod-fcmp-stressnet"];

describe("createMonerodFcmpStressnetService", () => {
  it("is off by default and registered in the service map", () => {
    const services = generateAllServices(makeFullConfig());
    expect(services["monerod-fcmp-stressnet"].checked).toBe(false);
  });

  it("runs the stressnet image on testnet with a persistent volume", () => {
    const config = makeFullConfig({ services: { isFcmpStressnet: true } });
    const service = createMonerodFcmpStressnetService(config);
    const spec = container(config);

    expect(service.checked).toBe(true);
    expect(spec.image).toBe("ghcr.io/hundehausen/monero-fcmp-docker:latest");
    expect(spec.command).toContain("--testnet");
    expect(spec.command).toContain("--rpc-restricted-bind-port=28089");
    expect(spec.command).toContain("--ban-list=/home/monero/ban_list.txt");
    expect(spec.command).not.toContain("--public-node");
    expect(spec.command).not.toContain("--prune-blockchain");
    expect(spec.volumes).toEqual(["bitmonero-fcmp-stressnet:/home/monero/.bitmonero"]);
    expect(service.volumes).toHaveProperty("bitmonero-fcmp-stressnet");
  });

  it("adds public-node and prune flags when enabled", () => {
    const spec = container(
      makeFullConfig({
        services: {
          isFcmpStressnet: true,
          isFcmpStressnetPublic: true,
          isFcmpStressnetPruned: true,
        },
      })
    );
    expect(spec.command).toContain("--public-node");
    expect(spec.command).toContain("--prune-blockchain");
  });

  it("keeps a private VPS node off public interfaces", () => {
    const config = makeFullConfig({
      networkMode: networkModes.exposed,
      services: { isFcmpStressnet: true },
    });
    expect(container(config).ports).toEqual(["127.0.0.1:28089:28089"]);
    expect(createMonerodFcmpStressnetService(config).ufw).toBeUndefined();
  });

  it("publishes P2P and RPC and opens the firewall for a public VPS node", () => {
    const config = makeFullConfig({
      networkMode: networkModes.exposed,
      services: { isFcmpStressnet: true, isFcmpStressnetPublic: true },
    });
    expect(container(config).ports).toEqual(["28080:28080", "28089:28089"]);
    expect(createMonerodFcmpStressnetService(config).ufw).toEqual([
      "28080/tcp",
      "28089/tcp",
    ]);
  });

  it("prints the restricted RPC URL after install", () => {
    const hints = installScriptHintsFromConfig(
      makeFullConfig({ services: { isFcmpStressnet: true } })
    );
    expect(hints.accessLines).toContainEqual({
      label: "FCMP++ stressnet restricted RPC",
      url: "http://localhost:28089",
    });
  });
});
