// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("nuqs", async () => {
  const React = await import("react");
  return {
    parseAsStringEnum: () => ({ withDefault: () => ({}) }),
    parseAsString: () => ({ withDefault: () => ({}) }),
    parseAsBoolean: () => ({ withDefault: () => ({}) }),
    parseAsInteger: () => ({ withDefault: () => ({}) }),
    useQueryState: (key: string) => {
      // Always call the same hooks so rules-of-hooks is satisfied; pick by key.
      const architecture = React.useState("linux/amd64");
      const networkMode = React.useState("local");
      if (key === "networkMode") return networkMode;
      return architecture;
    },
  };
});

vi.mock("@/lib/to-full-config", () => ({
  toFullConfig: () => ({}),
}));

vi.mock("@/lib/service-generators", () => ({
  generateAllServices: () => ({}),
  filterServicesByArchitecture: (services: unknown) => services,
}));

vi.mock("./services", async () => {
  const React = await import("react");

  const useP2PoolService = () => {
    const [p2PoolMode, setP2PoolMode] = React.useState("full");
    const [p2PoolPayoutAddress, setP2PoolPayoutAddress] = React.useState("");
    const [p2PoolMiningThreads, setP2PoolMiningThreads] = React.useState(4);
    return {
      stateFunctions: { p2PoolMode, setP2PoolMode, p2PoolPayoutAddress, setP2PoolPayoutAddress, p2PoolMiningThreads, setP2PoolMiningThreads },
    };
  };

  const useMonerodService = () => {
    const [zmqPubEnabled, setZmqPubEnabled] = React.useState(false);
    const [zmqPubBindPort, setZmqPubBindPort] = React.useState("18083");
    return {
      stateFunctions: { isPrunedNode: false, isSyncPrunedBlocks: false, setIsSyncPrunedBlocks: () => {}, zmqPubEnabled, setZmqPubEnabled, zmqPubBindPort, setZmqPubBindPort },
    };
  };

  const useMonitoringService = () => {
    return {
      stateFunctions: { isMonitoring: false, setIsMonitoring: () => {}, grafanaDomain: "localhost:3000", setGrafanaDomain: () => {} },
    };
  };

  const useXmrigService = () => {
    const [miningMode, setMiningMode] = React.useState("xmrig");
    const [xmrigDonateLevel, setXmrigDonateLevel] = React.useState(1);
    return {
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
      stateFunctions: { isStagenetNode: false },
    }),
    useP2PoolService,
    useMoneroWalletRpcService: () => {
      const [isMoneroWalletRpc, setIsMoneroWalletRpc] = React.useState(false);
      return {
        stateFunctions: { isMoneroWalletRpc, setIsMoneroWalletRpc },
      };
    },
    useTorService: () => {
      const [hsXmrigProxy, setHsXmrigProxy] = React.useState(false);
      return {
        stateFunctions: {
          torProxyMode: "none",
          isHiddenServices: false,
          hsLws: false,
          hsMoneroPay: false,
          hsXmrigProxy,
          setHsXmrigProxy,
        },
      };
    },
    useWatchtowerService: () => ({
      stateFunctions: { isWatchtower: false },
    }),
    useMonitoringService,
    useXmrigService,
    useXmrigProxyService: () => {
      const [isXmrigProxy, setIsXmrigProxy] = React.useState(false);
      const [isXmrigProxyPublic, setIsXmrigProxyPublic] = React.useState(false);
      return {
        stateFunctions: {
          isXmrigProxy,
          setIsXmrigProxy,
          isXmrigProxyPublic,
          setIsXmrigProxyPublic,
        },
      };
    },
    useTraefikService: () => ({
      stateFunctions: { isTraefik: false, isTraefikMonerod: false, isTraefikStagenet: false, isTraefikGrafana: false, isTraefikPortainer: false, isTraefikLws: false, isTraefikMoneroPay: false },
    }),
    usePortainerService: () => ({
      stateFunctions: { isPortainer: false, setPortainerDomain: () => {}, portainerDomain: "portainer.example.com" },
    }),
    useCuprateService: () => ({
      stateFunctions: { isCuprateEnabled: false },
    }),
    useMoneroLwsService: () => {
      const [isMoneroLws, setIsMoneroLws] = React.useState(false);
      return {
        stateFunctions: { isMoneroLws, setIsMoneroLws, lwsDomain: "lws.example.com", setLwsDomain: () => {} },
      };
    },
    useMoneroPayService: () => {
      const [isMoneroPay, setIsMoneroPay] = React.useState(false);
      return {
        stateFunctions: { isMoneroPay, setIsMoneroPay, moneroPayDomain: "pay.example.com", setMoneroPayDomain: () => {} },
      };
    },
  };
});

import { useServices } from "./use-services";

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

describe("useServices xmrig-proxy reset", () => {
  it("enabling proxy while p2PoolMode is none is reset to false", () => {
    const { result } = renderHook(() => useServices());

    act(() => {
      result.current.stateFunctions.setP2PoolMode("none");
    });
    expect(result.current.stateFunctions.p2PoolMode).toBe("none");

    act(() => {
      result.current.stateFunctions.setIsXmrigProxy(true);
    });

    expect(result.current.stateFunctions.isXmrigProxy).toBe(false);
  });

  it("clears public and hidden-service flags when P2Pool is switched to none", () => {
    const { result } = renderHook(() => useServices());

    act(() => {
      result.current.stateFunctions.setIsXmrigProxy(true);
      result.current.stateFunctions.setIsXmrigProxyPublic(true);
      result.current.stateFunctions.setHsXmrigProxy(true);
    });
    expect(result.current.stateFunctions.isXmrigProxy).toBe(true);
    expect(result.current.stateFunctions.isXmrigProxyPublic).toBe(true);
    expect(result.current.stateFunctions.hsXmrigProxy).toBe(true);

    act(() => {
      result.current.stateFunctions.setP2PoolMode("none");
    });

    expect(result.current.stateFunctions.isXmrigProxy).toBe(false);
    expect(result.current.stateFunctions.isXmrigProxyPublic).toBe(false);
    expect(result.current.stateFunctions.hsXmrigProxy).toBe(false);
  });

  it("enabling proxy then switching architecture to arm64 resets the flags", () => {
    const { result } = renderHook(() => useServices());

    act(() => {
      result.current.stateFunctions.setIsXmrigProxy(true);
      result.current.stateFunctions.setIsXmrigProxyPublic(true);
      result.current.stateFunctions.setHsXmrigProxy(true);
    });
    expect(result.current.stateFunctions.isXmrigProxy).toBe(true);
    expect(result.current.stateFunctions.architecture).toBe("linux/amd64");

    act(() => {
      result.current.stateFunctions.setArchitecture("linux/arm64");
    });

    expect(result.current.stateFunctions.architecture).toBe("linux/arm64");
    expect(result.current.stateFunctions.isXmrigProxy).toBe(false);
    expect(result.current.stateFunctions.isXmrigProxyPublic).toBe(false);
    expect(result.current.stateFunctions.hsXmrigProxy).toBe(false);
  });
});

describe("useServices MoneroPay auto-enable wallet-rpc", () => {
  it("enabling MoneroPay sets isMoneroWalletRpc true", () => {
    const { result } = renderHook(() => useServices());

    expect(result.current.stateFunctions.isMoneroWalletRpc).toBe(false);

    act(() => {
      result.current.stateFunctions.setIsMoneroPay(true);
    });

    expect(result.current.stateFunctions.isMoneroPay).toBe(true);
    expect(result.current.stateFunctions.isMoneroWalletRpc).toBe(true);
  });

  it("disabling wallet-rpc while MoneroPay is on is immediately turned back on", () => {
    const { result } = renderHook(() => useServices());

    act(() => {
      result.current.stateFunctions.setIsMoneroPay(true);
    });
    expect(result.current.stateFunctions.isMoneroWalletRpc).toBe(true);

    act(() => {
      result.current.stateFunctions.setIsMoneroWalletRpc(false);
    });

    expect(result.current.stateFunctions.isMoneroWalletRpc).toBe(true);
  });
});
