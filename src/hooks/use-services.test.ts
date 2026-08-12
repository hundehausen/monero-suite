// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("nuqs", () => ({
  parseAsStringEnum: () => ({ withDefault: () => ({}) }),
  parseAsString: () => ({ withDefault: () => ({}) }),
  parseAsBoolean: () => ({ withDefault: () => ({}) }),
  parseAsInteger: () => ({ withDefault: () => ({}) }),
  useQueryState: () => ["linux/amd64", () => {}],
}));

vi.mock("./services", async () => {
  const React = await import("react");

  // Minimal Service stub satisfying the ServiceMap built by useServices.
  const stub = (checked: boolean | string) => ({
    name: "stub",
    description: "",
    checked,
    required: false,
    architecture: ["linux/amd64", "linux/arm64"],
    code: {},
  });

  // Each service mock is a real React hook backed by useState so that
  // useServices' effects (e.g. the miningMode reset) can drive updates.
  const useP2PoolService = () => {
    const [p2PoolMode, setP2PoolMode] = React.useState("full");
    const [p2PoolPayoutAddress, setP2PoolPayoutAddress] = React.useState("");
    const [p2PoolMiningThreads, setP2PoolMiningThreads] = React.useState(4);
    return {
      // Record the resolved ZMQ port so tests can assert propagation.
      getP2PoolService: (_networkMode: string, _miningMode: string, _torProxyMode: string, zmqPubPort: number) => ({
        ...stub(p2PoolMode),
        code: { p2pool: { command: ["--zmq-port", String(zmqPubPort)] } },
      }),
      stateFunctions: { p2PoolMode, setP2PoolMode, p2PoolPayoutAddress, setP2PoolPayoutAddress, p2PoolMiningThreads, setP2PoolMiningThreads },
    };
  };

  const useMonerodService = () => {
    const [zmqPubEnabled, setZmqPubEnabled] = React.useState(false);
    const [zmqPubBindPort, setZmqPubBindPort] = React.useState("18083");
    return {
      getMonerodService: () => stub(true),
      stateFunctions: { isPrunedNode: false, isSyncPrunedBlocks: false, setIsSyncPrunedBlocks: () => {}, zmqPubEnabled, setZmqPubEnabled, zmqPubBindPort, setZmqPubBindPort },
    };
  };

  const useMonitoringService = () => {
    return {
      getMonitoringService: (_networkMode: string, _isTraefik: boolean) => ({
        ...stub(false),
        env: { GF_SECURITY_ADMIN_USER: "admin" },
      }),
      stateFunctions: { isMonitoring: false, setIsMonitoring: () => {}, grafanaDomain: "localhost:3000", setGrafanaDomain: () => {} },
    };
  };

  const useXmrigService = () => {
    const [miningMode, setMiningMode] = React.useState("xmrig");
    const [xmrigDonateLevel, setXmrigDonateLevel] = React.useState(1);
    return {
      getXmrigService: () => stub(miningMode),
      stateFunctions: { miningMode, setMiningMode, xmrigDonateLevel, setXmrigDonateLevel },
    };
  };

  return {
    architectures: { linuxAmd: "linux/amd64", linuxArm: "linux/arm64" },
    networkModes: { exposed: "exposed", local: "local" },
    p2poolModes: { none: "none", mini: "mini", full: "full", nano: "nano" },
    minigModes: { none: "none", xmrig: "xmrig", p2pool: "p2pool" },
    torProxyModes: { none: "none", txonly: "tx-only", full: "full" },
    CERT_RESOLVER_NAME: "monerosuite",
    useMonerodService,
    useMonerodStagenetService: () => ({
      getMonerodStagenetService: () => stub(false),
      stateFunctions: { isStagenetNode: false },
    }),
    useP2PoolService,
    useMoneroWalletRpcService: () => ({
      getMoneroWalletRpcService: () => stub(false),
      stateFunctions: { isMoneroWalletRpc: false, setIsMoneroWalletRpc: () => {} },
    }),
    useTorService: () => ({
      getTorService: () => stub(false),
      stateFunctions: { torProxyMode: "none", isHiddenServices: false, hsLws: false },
    }),
    useWatchtowerService: () => ({
      getWatchtowerService: () => stub(false),
      stateFunctions: { isWatchtower: false },
    }),
    useMonitoringService,
    useXmrigService,
    useTraefikService: () => ({
      getTraefikService: () => stub(false),
      stateFunctions: { isTraefik: false, isTraefikMonerod: false, isTraefikStagenet: false, isTraefikGrafana: false, isTraefikPortainer: false, isTraefikLws: false },
    }),
    usePortainerService: () => ({
      getPortainerService: () => stub(false),
      stateFunctions: { isPortainer: false, setPortainerDomain: () => {}, portainerDomain: "portainer.example.com" },
    }),
    useCuprateService: () => ({
      getCuprateService: () => stub(false),
      stateFunctions: { isCuprateEnabled: false },
    }),
    useMoneroLwsService: () => {
      const [isMoneroLws, setIsMoneroLws] = React.useState(false);
      return {
        getMoneroLwsService: (_n: string, _t: boolean, _c: string, _tor: string, zmqPubPort: number) => ({
          name: "Monero Light Wallet Server",
          description: "",
          checked: isMoneroLws,
          required: false,
          architecture: ["linux/amd64", "linux/arm64"],
          code: { "monero-lws": { command: ["--sub=tcp://monerod:" + zmqPubPort] } },
        }),
        stateFunctions: { isMoneroLws, setIsMoneroLws, lwsDomain: "lws.example.com", setLwsDomain: () => {} },
      };
    },
  };
});

import { useServices } from "./use-services";
import { MONEROD_PORTS } from "@/lib/constants";

describe("useServices miningMode reset (fix 6)", () => {
  it("resets miningMode to none when P2Pool is switched to none", () => {
    const { result } = renderHook(() => useServices());
    const { setP2PoolMode } = result.current.stateFunctions;

    // Sanity: mining starts out as xmrig with p2pool on full
    expect(result.current.stateFunctions.p2PoolMode).toBe("full");
    expect(result.current.stateFunctions.miningMode).toBe("xmrig");

    // Turn P2Pool off -> miningMode must reset to "none"
    act(() => setP2PoolMode("none"));
    expect(result.current.stateFunctions.p2PoolMode).toBe("none");
    expect(result.current.stateFunctions.miningMode).toBe("none");
  });

  it("leaves miningMode alone while P2Pool stays enabled", () => {
    const { result } = renderHook(() => useServices());
    expect(result.current.stateFunctions.p2PoolMode).toBe("full");
    expect(result.current.stateFunctions.miningMode).toBe("xmrig");
  });
});

describe("useServices ZMQ port propagation", () => {
  it("forwards a custom ZMQ pub port to p2pool", () => {
    const { result } = renderHook(() => useServices());
    act(() => {
      result.current.stateFunctions.setZmqPubEnabled(true);
      result.current.stateFunctions.setZmqPubBindPort("18090");
    });

    const p2pool = result.current.services.p2pool.code.p2pool as { command?: string[] };
    expect(p2pool.command?.[1]).toBe("18090");
  });

  it("falls back to the default ZMQ port for malformed values instead of NaN", () => {
    const { result } = renderHook(() => useServices());
    act(() => {
      result.current.stateFunctions.setZmqPubEnabled(true);
      result.current.stateFunctions.setZmqPubBindPort("abc");
    });

    const p2pool = result.current.services.p2pool.code.p2pool as { command?: string[] };
    expect(p2pool.command?.[1]).toBe(String(MONEROD_PORTS.zmqPub));
  });
});

describe("useServices monero-lws wiring", () => {
  it("enables monero-lws and forwards the ZMQ pub port", () => {
    const { result } = renderHook(() => useServices());

    act(() => {
      result.current.stateFunctions.setIsMoneroLws(true);
    });

    expect(result.current.services["monero-lws"].checked).toBe(true);
    const lws = result.current.services["monero-lws"].code["monero-lws"] as {
      command?: string[];
    };
    expect(lws.command?.[0]).toContain(`tcp://monerod:`);
    expect(lws.command?.[0]).toContain(String(MONEROD_PORTS.zmqPub));
  });
});
