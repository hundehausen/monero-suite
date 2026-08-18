import { describe, expect, it } from "vitest";
import { fullConfigSchema, type FullConfig } from "./config-schema";
import { toFullConfig, type FlatConfigState } from "./to-full-config";

const nested = (): FullConfig => ({
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
    p2PoolMode: "none",
    p2PoolPayoutAddress: "",
    p2PoolMiningThreads: 1,
    isP2PoolStratumPublic: false,
  },
  mining: { miningMode: "none", xmrigDonateLevel: 1 },
  tor: {
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
  },
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
});

function flatten(config: FullConfig): FlatConfigState {
  return {
    architecture: config.architecture,
    networkMode: config.networkMode,
    ...config.monerod,
    ...config.stagenet,
    ...config.p2pool,
    ...config.mining,
    ...config.tor,
    ...config.services,
  };
}

describe("toFullConfig", () => {
  it("rebuilds a FullConfig that passes the schema", () => {
    const source = nested();
    const result = toFullConfig(flatten(source));
    expect(fullConfigSchema.safeParse(result).success).toBe(true);
    expect(result.monerod).toEqual(source.monerod);
    expect(result.stagenet).toEqual(source.stagenet);
    expect(result.p2pool).toEqual(source.p2pool);
    expect(result.mining).toEqual(source.mining);
    expect(result.tor).toEqual(source.tor);
    expect(result.services).toEqual(source.services);
    expect(result.architecture).toBe(source.architecture);
    expect(result.networkMode).toBe(source.networkMode);
  });

  it("sets enabledBashServices from the service flags", () => {
    const source = nested();
    source.services.isMonitoring = true;
    source.services.isCuprateEnabled = true;
    const result = toFullConfig(flatten(source));
    expect(result.enabledBashServices).toEqual({
      monitoring: true,
      cuprate: true,
    });
  });
});
