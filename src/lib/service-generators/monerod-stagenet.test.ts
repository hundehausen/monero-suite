import { describe, expect, it } from "vitest";
import { createMonerodStagenetService } from "./monerod-stagenet";
import { networkModes, torProxyModes, TorProxyMode, NetworkMode } from "@/lib/service-types";
import { makeFullConfig, type DeepPartial } from "@/lib/make-full-config";
import type { FullConfig } from "@/lib/config-schema";

const run = (
  stagenet: DeepPartial<FullConfig["stagenet"]> = {},
  opts: {
    networkMode?: NetworkMode;
    isTraefik?: boolean;
    torProxyMode?: TorProxyMode;
  } = {}
) => {
  const config = makeFullConfig({
    stagenet: { isStagenetNode: true, ...stagenet },
    networkMode: opts.networkMode,
    tor: { torProxyMode: opts.torProxyMode },
    services: {
      isTraefik: opts.isTraefik,
      isTraefikStagenet: opts.isTraefik,
    },
  });
  return createMonerodStagenetService(config);
};

describe("createMonerodStagenetService", () => {
  it("points the Traefik load balancer at the stagenet restricted RPC port (38089)", () => {
    const service = run(
      { stagenetNodeDomain: "stagenet.mydomain.com" },
      { isTraefik: true }
    );
    const labels = service.code["monerod-stagenet"].labels as Record<string, string>;
    expect(labels["traefik.http.services.monerod-stagenet.loadbalancer.server.port"]).toBe("38089");
  });

  it.each<[TorProxyMode]>([
    [torProxyModes.full],
    [torProxyModes.txonly],
  ])("waits for tor with service_started (tor has no healthcheck) when proxy mode is %s", (torProxyMode) => {
    const service = run({}, { torProxyMode });
    expect(service.code["monerod-stagenet"].depends_on).not.toBeUndefined();
    const depends = service.code["monerod-stagenet"].depends_on as {
      tor?: { condition?: string };
    };
    expect(depends.tor?.condition).toBe("service_started");
    expect(depends.tor?.condition).not.toBe("service_healthy");
  });

  it("does not depend on tor when proxy mode is none", () => {
    const service = run({}, { torProxyMode: torProxyModes.none });
    expect(service.code["monerod-stagenet"].depends_on).toBeUndefined();
  });
});

describe("createMonerodStagenetService host port publishing", () => {
  type Container = { command?: string[]; ports?: string[] };

  const code = (stateOverrides: DeepPartial<FullConfig["stagenet"]>, networkMode: NetworkMode): Container => {
    const service = run(stateOverrides, { networkMode });
    return service.code["monerod-stagenet"] as unknown as Container;
  };

  it("publishes only the P2P and restricted RPC ports — never the unrestricted RPC — in local mode", () => {
    const monerodStagenet = code({}, networkModes.local);
    expect(monerodStagenet.ports).toEqual(["38080:38080", "38089:38089"]);
  });

  it("omits the P2P host mapping in exposed mode for a private stagenet node", () => {
    const monerodStagenet = code({}, networkModes.exposed);
    expect(monerodStagenet.ports).toEqual(["127.0.0.1:38089:38089"]);
  });

  it("publishes P2P on all interfaces for a public stagenet node on a VPS", () => {
    const monerodStagenet = code({ isStagenetNodePublic: true }, networkModes.exposed);
    expect(monerodStagenet.ports).toEqual(["38080:38080", "38089:38089"]);
  });

  it("still binds the unrestricted RPC inside the container so other services reach it", () => {
    const monerodStagenet = code({}, networkModes.local);
    expect(monerodStagenet.command).toContain("--rpc-bind-ip=0.0.0.0");
    expect(monerodStagenet.command).toContain("--rpc-bind-port=38081");
  });

  it("sets --ban-list to the image path because compose command replaces CMD", () => {
    const monerodStagenet = code({}, networkModes.local);
    expect(monerodStagenet.command).toContain("--ban-list=/home/monero/ban_list.txt");
  });
});
