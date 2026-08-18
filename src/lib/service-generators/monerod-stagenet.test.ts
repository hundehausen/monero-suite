import { describe, expect, it } from "vitest";
import { createMonerodStagenetService } from "./monerod-stagenet";
import { networkModes, torProxyModes, TorProxyMode, NetworkMode } from "@/lib/service-types";

const baseState = {
  isStagenetNode: true,
  isStagenetNodePublic: false,
  isMoneroStagenetCustomLocation: false,
  moneroStagenetBlockchainLocation: "~/.bitmonero",
  stagenetNodeDomain: "stagenet.example.com",
};

describe("createMonerodStagenetService", () => {
  it("points the Traefik load balancer at the stagenet restricted RPC port (38089)", () => {
    const service = createMonerodStagenetService(
      { ...baseState, stagenetNodeDomain: "stagenet.mydomain.com" },
      false,
      networkModes.local,
      true,
      "monerosuite",
      torProxyModes.none
    );
    const labels = service.code["monerod-stagenet"].labels as Record<string, string>;
    expect(labels["traefik.http.services.monerod-stagenet.loadbalancer.server.port"]).toBe("38089");
  });

  it.each<[TorProxyMode]>([
    [torProxyModes.full],
    [torProxyModes.txonly],
  ])("waits for tor with service_started (tor has no healthcheck) when proxy mode is %s", (torProxyMode) => {
    const service = createMonerodStagenetService(
      baseState,
      false,
      networkModes.local,
      false,
      "monerosuite",
      torProxyMode
    );
    expect(service.code["monerod-stagenet"].depends_on).not.toBeUndefined();
    const depends = service.code["monerod-stagenet"].depends_on as {
      tor?: { condition?: string };
    };
    expect(depends.tor?.condition).toBe("service_started");
    expect(depends.tor?.condition).not.toBe("service_healthy");
  });

  it("does not depend on tor when proxy mode is none", () => {
    const service = createMonerodStagenetService(
      baseState,
      false,
      networkModes.local,
      false,
      "monerosuite",
      torProxyModes.none
    );
    expect(service.code["monerod-stagenet"].depends_on).toBeUndefined();
  });
});

describe("createMonerodStagenetService host port publishing", () => {
  type Container = { command?: string[]; ports?: string[] };

  const code = (stateOverrides: Partial<typeof baseState>, networkMode: NetworkMode): Container => {
    const service = createMonerodStagenetService(
      { ...baseState, ...stateOverrides },
      false,
      networkMode,
      false,
      "monerosuite",
      torProxyModes.none
    );
    return service.code["monerod-stagenet"] as unknown as Container;
  };

  it("publishes only the P2P and restricted RPC ports — never the unrestricted RPC — in local mode", () => {
    const monerodStagenet = code({}, networkModes.local);
    expect(monerodStagenet.ports).toEqual(["38080:38080", "38089:38089"]);
  });

  it("localhost-prefixes port bindings in exposed mode", () => {
    const monerodStagenet = code({}, networkModes.exposed);
    expect(monerodStagenet.ports).toEqual([
      "127.0.0.1:38080:38080",
      "127.0.0.1:38089:38089",
    ]);
  });

  it("still binds the unrestricted RPC inside the container so other services reach it", () => {
    const monerodStagenet = code({}, networkModes.local);
    expect(monerodStagenet.command).toContain("--rpc-bind-ip=0.0.0.0");
    expect(monerodStagenet.command).toContain("--rpc-bind-port=38081");
  });
});
