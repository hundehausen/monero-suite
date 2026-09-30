// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("nuqs", async () => {
  const React = await import("react");
  return {
    parseAsStringEnum: () => ({ withDefault: () => ({}) }),
    parseAsString: Object.assign(() => ({ withDefault: () => ({}) }), {
      withDefault: () => ({}),
    }),
    parseAsBoolean: Object.assign(() => ({ withDefault: () => ({}) }), {
      withDefault: () => ({}),
    }),
    parseAsInteger: () => ({ withDefault: () => ({}) }),
    useQueryState: (key: string) => {
      // Always call the same hooks so rules-of-hooks is satisfied; pick by key.
      const architecture = React.useState("linux/amd64");
      const networkMode = React.useState("local");
      const upgradeSystemPackages = React.useState(false);
      const rpcLogin = React.useState(null);
      const bootstrapDaemonLogin = React.useState(null);
      if (key === "networkMode") return networkMode;
      if (key === "upgradeSystemPackages") return upgradeSystemPackages;
      if (key === "rpcLogin") return rpcLogin;
      if (key === "bootstrapDaemonLogin") return bootstrapDaemonLogin;
      return architecture;
    },
  };
});

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
      stateFunctions: {
        isMonitoring: false,
        setIsMonitoring: () => {},
        grafanaDomain: "localhost:3000",
        setGrafanaDomain: () => {},
        grafanaAdminUser: "admin",
        setGrafanaAdminUser: () => {},
        grafanaAdminPassword: "admin",
        setGrafanaAdminPassword: () => {},
      },
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
    useMonerodService,
    useMonerodStagenetService: () => ({
      stateFunctions: { isStagenetNode: false },
    }),
    useP2PoolService,
    useMoneroWalletRpcService: () => {
      const [isMoneroWalletRpc, setIsMoneroWalletRpc] = React.useState(false);
      return {
        stateFunctions: {
          isMoneroWalletRpc,
          setIsMoneroWalletRpc,
          walletRpcUser: "monero",
          setWalletRpcUser: () => {},
          walletRpcPassword: "changeme",
          setWalletRpcPassword: () => {},
        },
      };
    },
    useTorService: () => {
      const [hsP2Pool, setHsP2Pool] = React.useState(false);
      return {
        stateFunctions: {
          torProxyMode: "none",
          isHiddenServices: false,
          hsLws: false,
          hsMoneroPay: false,
          hsP2Pool,
          setHsP2Pool,
        },
      };
    },
    useWatchtowerService: () => ({
      stateFunctions: {
        isWatchtower: false,
        watchtowerUpdateFrequency: "hourly",
        watchtowerCooldownDelay: "24h",
      },
    }),
    useMonitoringService,
    useXmrigService,
    useTraefikService: () => ({
      stateFunctions: { isTraefik: false, isTraefikMonerod: false, isTraefikStagenet: false, isTraefikGrafana: false, isTraefikPortainer: false, isTraefikLws: false, isTraefikMoneroPay: false },
    }),
    usePortainerService: () => ({
      stateFunctions: { isPortainer: false, setPortainerDomain: () => {}, portainerDomain: "portainer.example.com" },
    }),
    useCuprateService: () => ({
      stateFunctions: { isCuprateEnabled: false },
    }),
    useFcmpStressnetService: () => ({
      stateFunctions: {
        isFcmpStressnet: false,
        isFcmpStressnetPublic: false,
        isFcmpStressnetPruned: false,
      },
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

  it("clears hsP2Pool when P2Pool is switched to none", () => {
    const { result } = renderHook(() => useServices());

    act(() => {
      result.current.stateFunctions.setHsP2Pool(true);
    });
    expect(result.current.stateFunctions.hsP2Pool).toBe(true);

    act(() => {
      result.current.stateFunctions.setP2PoolMode("none");
    });
    expect(result.current.stateFunctions.p2PoolMode).toBe("none");
    expect(result.current.stateFunctions.hsP2Pool).toBe(false);
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
