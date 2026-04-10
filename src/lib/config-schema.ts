import { z } from "zod/v4";
import {
  domainSchema,
  hostPortSchema,
  commandValueSchema,
  moneroAddressSchema,
  pathSchema,
  portSchema,
  numericStringSchema,
  signedNumericStringSchema,
  rpcLoginSchema,
  rpcSslSchema,
} from "@/lib/schemas";

const architectureSchema = z.enum(["linux/amd64", "linux/arm64"]);
const networkModeSchema = z.enum(["exposed", "local"]);
const p2PoolModeSchema = z.enum(["none", "mini", "full", "nano"]);
const miningModeSchema = z.enum(["none", "xmrig", "p2pool"]);
const torProxyModeSchema = z.enum(["none", "tx-only", "full"]);

const monerodConfigSchema = z.object({
  isMoneroPublicNode: z.boolean(),
  moneroNodeNoLogs: z.boolean(),
  moneroNodeDomain: domainSchema,
  isPrunedNode: z.boolean(),
  isSyncPrunedBlocks: z.boolean(),
  isMoneroMainnetVolume: z.boolean(),
  moneroMainnetBlockchainLocation: pathSchema,
  logLevel: numericStringSchema,
  maxLogFileSize: numericStringSchema,
  maxLogFiles: numericStringSchema,
  p2pBindPort: portSchema,
  outPeers: numericStringSchema,
  inPeers: numericStringSchema,
  limitRateUp: signedNumericStringSchema,
  limitRateDown: numericStringSchema,
  noIgd: z.boolean(),
  hidePort: z.boolean(),
  allowLocalIp: z.boolean(),
  maxConnectionsPerIp: numericStringSchema,
  p2pExternalPort: portSchema,
  offlineMode: z.boolean(),
  padTransactions: z.boolean(),
  anonymousInbound: commandValueSchema,
  txProxyDisableNoise: z.boolean(),
  banList: commandValueSchema,
  enableDnsBlocklist: z.boolean(),
  disableDnsCheckpoints: z.boolean(),
  seedNode: hostPortSchema,
  addPeer: z.string().max(2048),
  addPriorityNode: z.string().max(2048),
  addExclusiveNode: z.string().max(2048),
  dbSyncMode: commandValueSchema,
  blockSyncSize: numericStringSchema,
  enforceCheckpointing: z.boolean(),
  fastBlockSync: z.boolean(),
  preparationThreads: numericStringSchema,
  maxConcurrency: numericStringSchema,
  bootstrapDaemonAddress: hostPortSchema,
  bootstrapDaemonLogin: rpcLoginSchema,
  zmqPubEnabled: z.boolean(),
  zmqPubBindPort: portSchema,
  rpcSsl: rpcSslSchema,
  rpcLogin: rpcLoginSchema,
  disableRpcBan: z.boolean(),
  maxTxpoolWeight: numericStringSchema,
  startMining: moneroAddressSchema,
  miningThreads: numericStringSchema,
  bgMiningEnable: z.boolean(),
  bgMiningIgnoreBattery: z.boolean(),
  blockNotify: commandValueSchema,
  reorgNotify: commandValueSchema,
  blockRateNotify: commandValueSchema,
});

const stagenetConfigSchema = z.object({
  isStagenetNode: z.boolean(),
  isStagenetNodePublic: z.boolean(),
  isMoneroStagenetCustomLocation: z.boolean(),
  moneroStagenetBlockchainLocation: pathSchema,
  stagenetNodeDomain: domainSchema,
});

const p2poolConfigSchema = z.object({
  p2PoolMode: p2PoolModeSchema,
  p2PoolPayoutAddress: moneroAddressSchema,
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
  moneroBlockDomain: domainSchema,
  isOnionMoneroBlockchainExplorer: z.boolean(),
  onionMoneroBlockchainExplorerDomain: domainSchema,
  isWatchtower: z.boolean(),
  isMonitoring: z.boolean(),
  grafanaDomain: domainSchema,
  isAutoheal: z.boolean(),
  isTraefik: z.boolean(),
  isTraefikMonerod: z.boolean(),
  isTraefikStagenet: z.boolean(),
  isTraefikMoneroblock: z.boolean(),
  isTraefikOnionExplorer: z.boolean(),
  isTraefikGrafana: z.boolean(),
  isTraefikPortainer: z.boolean(),
  isPortainer: z.boolean(),
  portainerDomain: domainSchema,
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
