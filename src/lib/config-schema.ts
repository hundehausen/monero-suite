import { z } from "zod/v4";

const architectureSchema = z.enum(["linux/amd64", "linux/arm64"]);
const networkModeSchema = z.enum(["exposed", "local"]);
const p2PoolModeSchema = z.enum(["none", "mini", "full", "nano"]);
const miningModeSchema = z.enum(["none", "xmrig", "p2pool"]);
const torProxyModeSchema = z.enum(["none", "tx-only", "full"]);
const rpcSslSchema = z.string().max(10);

const monerodConfigSchema = z.object({
  isMoneroPublicNode: z.boolean(),
  moneroNodeNoLogs: z.boolean(),
  moneroNodeDomain: z.string().max(253),
  isPrunedNode: z.boolean(),
  isSyncPrunedBlocks: z.boolean(),
  isMoneroMainnetVolume: z.boolean(),
  moneroMainnetBlockchainLocation: z.string().max(256),
  logLevel: z.string().max(4),
  maxLogFileSize: z.string().max(12),
  maxLogFiles: z.string().max(4),
  p2pBindPort: z.string().max(6),
  outPeers: z.string().max(6),
  inPeers: z.string().max(6),
  limitRateUp: z.string().max(10),
  limitRateDown: z.string().max(10),
  noIgd: z.boolean(),
  hidePort: z.boolean(),
  allowLocalIp: z.boolean(),
  maxConnectionsPerIp: z.string().max(6),
  p2pExternalPort: z.string().max(6),
  offlineMode: z.boolean(),
  padTransactions: z.boolean(),
  anonymousInbound: z.string().max(256),
  txProxyDisableNoise: z.boolean(),
  banList: z.string().max(256),
  enableDnsBlocklist: z.boolean(),
  disableDnsCheckpoints: z.boolean(),
  seedNode: z.string().max(256),
  addPeer: z.string().max(2048),
  addPriorityNode: z.string().max(2048),
  addExclusiveNode: z.string().max(2048),
  dbSyncMode: z.string().max(32),
  blockSyncSize: z.string().max(10),
  enforceCheckpointing: z.boolean(),
  fastBlockSync: z.boolean(),
  preparationThreads: z.string().max(4),
  maxConcurrency: z.string().max(4),
  bootstrapDaemonAddress: z.string().max(256),
  bootstrapDaemonLogin: z.string().max(128),
  zmqPubEnabled: z.boolean(),
  zmqPubBindPort: z.string().max(6),
  rpcSsl: rpcSslSchema,
  rpcLogin: z.string().max(128),
  disableRpcBan: z.boolean(),
  maxTxpoolWeight: z.string().max(12),
  startMining: z.string().max(96),
  miningThreads: z.string().max(4),
  bgMiningEnable: z.boolean(),
  bgMiningIgnoreBattery: z.boolean(),
  blockNotify: z.string().max(256),
  reorgNotify: z.string().max(256),
  blockRateNotify: z.string().max(256),
});

const stagenetConfigSchema = z.object({
  isStagenetNode: z.boolean(),
  isStagenetNodePublic: z.boolean(),
  isMoneroStagenetCustomLocation: z.boolean(),
  moneroStagenetBlockchainLocation: z.string().max(256),
  stagenetNodeDomain: z.string().max(253),
});

const p2poolConfigSchema = z.object({
  p2PoolMode: p2PoolModeSchema,
  p2PoolPayoutAddress: z.string().max(95),
  p2PoolMiningThreads: z.number().int().min(1).max(256),
});

const miningConfigSchema = z.object({
  miningMode: miningModeSchema,
  xmrigDonateLevel: z.number().int().min(0).max(100),
});

const torConfigSchema = z.object({
  torProxyMode: torProxyModeSchema,
  hsMonerod: z.boolean(),
  hsMonerodP2P: z.boolean(),
  hsStagenet: z.boolean(),
  hsP2Pool: z.boolean(),
  hsMoneroblock: z.boolean(),
  hsOnionExplorer: z.boolean(),
  hsGrafana: z.boolean(),
  isGlobalTorProxy: z.boolean(),
});

const serviceToggleSchema = z.object({
  isMoneroWalletRpc: z.boolean(),
  isMoneroblock: z.boolean(),
  isMoneroblockLoggingDisabled: z.boolean(),
  moneroBlockDomain: z.string().max(253),
  isOnionMoneroBlockchainExplorer: z.boolean(),
  onionMoneroBlockchainExplorerDomain: z.string().max(253),
  isWatchtower: z.boolean(),
  isMonitoring: z.boolean(),
  grafanaDomain: z.string().max(253),
  isAutoheal: z.boolean(),
  isTraefik: z.boolean(),
  isTraefikMonerod: z.boolean(),
  isTraefikStagenet: z.boolean(),
  isTraefikMoneroblock: z.boolean(),
  isTraefikOnionExplorer: z.boolean(),
  isTraefikGrafana: z.boolean(),
  isTraefikPortainer: z.boolean(),
  isPortainer: z.boolean(),
  portainerDomain: z.string().max(253),
  isCuprateEnabled: z.boolean(),
});

export const fullConfigSchema = z.object({
  architecture: architectureSchema,
  networkMode: networkModeSchema,
  monerod: monerodConfigSchema,
  stagenet: stagenetConfigSchema,
  p2pool: p2poolConfigSchema,
  mining: miningConfigSchema,
  tor: torConfigSchema,
  services: serviceToggleSchema,
  enabledBashServices: z.object({
    monitoring: z.boolean(),
  }),
});

export type FullConfig = z.infer<typeof fullConfigSchema>;
