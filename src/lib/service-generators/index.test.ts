import { describe, expect, it } from "vitest";
import type { FullConfig } from "@/lib/config-schema";
import { p2poolModes } from "@/lib/service-types";
import {
  anyHiddenService,
  filterServicesByArchitecture,
  generateAllServices,
} from "./index";

const VALID_ADDRESS = `4${"1".repeat(94)}`;

const emptyTor: FullConfig["tor"] = {
  torProxyMode: "none",
  hsMonerod: false,
  hsMonerodP2P: false,
  hsStagenet: false,
  hsP2Pool: false,
  hsGrafana: false,
  hsLws: false,
  hsMoneroPay: false,
  hsXmrigProxy: false,
  isGlobalTorProxy: false,
};

function baseConfig(overrides: Partial<FullConfig> = {}): FullConfig {
  return {
    architecture: "linux/amd64",
    networkMode: "local",
    monerod: {
      isMoneroPublicNode: false,
      moneroNodeNoLogs: false,
      moneroNodeDomain: "node.example.com",
      isPrunedNode: false,
      isSyncPrunedBlocks: false,
      isMoneroMainnetVolume: true,
      moneroMainnetBlockchainLocation: "",
      logLevel: "0",
      maxLogFileSize: "104850000",
      maxLogFiles: "50",
      p2pBindPort: "18080",
      outPeers: "64",
      inPeers: "32",
      limitRateUp: "1048576",
      limitRateDown: "2048",
      hidePort: false,
      allowLocalIp: false,
      maxConnectionsPerIp: "1",
      p2pExternalPort: "0",
      offlineMode: false,
      padTransactions: false,
      anonymousInbound: "",
      txProxyDisableNoise: false,
      banList: "",
      enableDnsBlocklist: false,
      dnsCheckpoints: "default",
      seedNode: "",
      addPeer: "",
      addPriorityNode: "",
      addExclusiveNode: "",
      dbSyncMode: "",
      blockSyncSize: "0",
      fastBlockSync: true,
      preparationThreads: "4",
      maxConcurrency: "0",
      bootstrapDaemonAddress: "",
      bootstrapDaemonLogin: "",
      zmqPubEnabled: false,
      zmqPubBindPort: "18083",
      rpcLogin: "",
      disableRpcBan: false,
      maxTxpoolWeight: "0",
      startMining: "",
      miningThreads: "1",
      bgMiningEnable: false,
      bgMiningIgnoreBattery: false,
      blockNotify: "",
      reorgNotify: "",
      blockRateNotify: "",
    },
    stagenet: {
      isStagenetNode: false,
      isStagenetNodePublic: false,
      isMoneroStagenetCustomLocation: false,
      moneroStagenetBlockchainLocation: "",
      stagenetNodeDomain: "stagenet.example.com",
    },
    p2pool: {
      p2PoolMode: p2poolModes.none,
      p2PoolPayoutAddress: "",
      p2PoolMiningThreads: 1,
      isP2PoolStratumPublic: false,
    },
    mining: { miningMode: "none", xmrigDonateLevel: 1 },
    tor: { ...emptyTor },
    services: {
      isMoneroWalletRpc: false,
      isWatchtower: false,
      isMonitoring: false,
      grafanaDomain: "grafana.example.com",
      isTraefik: false,
      isTraefikMonerod: false,
      isTraefikStagenet: false,
      isTraefikGrafana: false,
      isTraefikPortainer: false,
      isPortainer: false,
      portainerDomain: "portainer.example.com",
      isCuprateEnabled: false,
      isMoneroLws: false,
      isMoneroPay: false,
      isXmrigProxy: false,
      isXmrigProxyPublic: false,
      isTraefikLws: false,
      isTraefikMoneroPay: false,
      lwsDomain: "lws.example.com",
      moneroPayDomain: "pay.example.com",
    },
    enabledBashServices: { monitoring: false, cuprate: false },
    ...overrides,
  };
}

describe("anyHiddenService", () => {
  it("is false when every hidden-service flag is off", () => {
    expect(anyHiddenService(emptyTor)).toBe(false);
  });

  it("is true when only hsXmrigProxy is on", () => {
    expect(anyHiddenService({ ...emptyTor, hsXmrigProxy: true })).toBe(true);
  });
});

describe("generateAllServices hidden services", () => {
  it("adds --disable-rpc-ban when only the xmrig-proxy hidden service is on", () => {
    const services = generateAllServices(
      baseConfig({
        tor: { ...emptyTor, hsXmrigProxy: true },
      })
    );
    const command = services.monerod.code.monerod?.command as string[];
    expect(command).toContain("--disable-rpc-ban");
  });
});

describe("filterServicesByArchitecture", () => {
  const proxyOn = baseConfig({
    p2pool: {
      p2PoolMode: p2poolModes.full,
      p2PoolPayoutAddress: VALID_ADDRESS,
      p2PoolMiningThreads: 4,
      isP2PoolStratumPublic: false,
    },
    services: {
      ...baseConfig().services,
      isXmrigProxy: true,
    },
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
