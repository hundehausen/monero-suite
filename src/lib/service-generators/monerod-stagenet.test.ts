import { describe, expect, it } from "vitest";
import { createMonerodStagenetService } from "./monerod-stagenet";
import { networkModes, torProxyModes, TorProxyMode } from "@/hooks/services/types";

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
      baseState,
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
