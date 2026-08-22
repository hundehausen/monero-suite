import type { FullConfig } from "./config-schema";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends unknown[]
      ? T[K]
      : DeepPartial<T[K]>
    : T[K];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
  if (override === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override as T;
  }
  const result = { ...base } as T;
  for (const key of Object.keys(override) as (keyof T)[]) {
    const next = override[key];
    if (next === undefined) continue;
    const current = (base as Record<string, unknown>)[key as string];
    (result as Record<string, unknown>)[key as string] =
      isPlainObject(current) && isPlainObject(next)
        ? deepMerge(current, next)
        : next;
  }
  return result;
}

const defaultFullConfig = (): FullConfig => ({
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
});

export function makeFullConfig(
  ...overrides: Array<DeepPartial<FullConfig> | undefined>
): FullConfig {
  return overrides.reduce<FullConfig>(
    (config, override) => deepMerge(config, override),
    defaultFullConfig()
  );
}
