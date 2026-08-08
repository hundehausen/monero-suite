import { z } from "zod/v4";
import {
  domainSchema,
  hostPortSchema,
  hostListStringSchema,
  commandValueSchema,
  moneroAddressSchema,
  p2PoolPayoutAddressSchema,
  pathSchema,
  portSchema,
  numericStringSchema,
  signedNumericStringSchema,
  rpcLoginSchema,
} from "@/lib/schemas";
import {
  getMonerodP2pPortCollisions,
  getMonerodZmqPortCollisions,
  getMonerodCollisionRoleLabel,
} from "@/lib/service-generators/monerod";

const architectureSchema = z.enum(["linux/amd64", "linux/arm64"]);
const networkModeSchema = z.enum(["exposed", "local"]);
const p2PoolModeSchema = z.enum(["none", "mini", "full", "nano"]);
const miningModeSchema = z.enum(["none", "xmrig", "p2pool"]);
const torProxyModeSchema = z.enum(["none", "tx-only", "full"]);
const dnsCheckpointsSchema = z.enum(["default", "skip", "enforce"]);

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
  outPeers: signedNumericStringSchema,
  inPeers: signedNumericStringSchema,
  limitRateUp: signedNumericStringSchema,
  limitRateDown: signedNumericStringSchema,
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
  dnsCheckpoints: dnsCheckpointsSchema,
  seedNode: hostPortSchema,
  addPeer: hostListStringSchema,
  addPriorityNode: hostListStringSchema,
  addExclusiveNode: hostListStringSchema,
  dbSyncMode: commandValueSchema,
  blockSyncSize: numericStringSchema,
  fastBlockSync: z.boolean(),
  preparationThreads: numericStringSchema,
  maxConcurrency: numericStringSchema,
  bootstrapDaemonAddress: hostPortSchema,
  bootstrapDaemonLogin: rpcLoginSchema,
  zmqPubEnabled: z.boolean(),
  zmqPubBindPort: portSchema,
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
  p2PoolPayoutAddress: p2PoolPayoutAddressSchema,
  p2PoolMiningThreads: z.number().int().min(1).max(256),
  isP2PoolStratumPublic: z.boolean(),
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
  hsGrafana: z.boolean(),
  isGlobalTorProxy: z.boolean(),
});

const serviceToggleSchema = z.object({
  isMoneroWalletRpc: z.boolean(),
  isWatchtower: z.boolean(),
  isMonitoring: z.boolean(),
  grafanaDomain: domainSchema,
  isTraefik: z.boolean(),
  isTraefikMonerod: z.boolean(),
  isTraefikStagenet: z.boolean(),
  isTraefikGrafana: z.boolean(),
  isTraefikPortainer: z.boolean(),
  isPortainer: z.boolean(),
  portainerDomain: domainSchema,
  isCuprateEnabled: z.boolean(),
});

export const fullConfigSchema = z
  .object({
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
      cuprate: z.boolean(),
    }),
  })
  .superRefine((config, ctx) => {
    // The P2P bind port must not collide with the ports monerod binds inside
    // the container (RPC + active ZMQ). Kept in lockstep with the client-side
    // gating via getMonerodP2pPortCollisions.
    const p2pCollisions = getMonerodP2pPortCollisions(
      config.monerod.p2pBindPort,
      config.monerod.zmqPubEnabled,
      config.monerod.zmqPubBindPort,
      config.p2pool.p2PoolMode,
      config.services.isMonitoring
    );
    if (p2pCollisions.length > 0) {
      const roles = p2pCollisions
        .map((port) => getMonerodCollisionRoleLabel("p2p", port))
        .join(" and ");
      ctx.addIssue({
        code: "custom",
        path: ["monerod", "p2pBindPort"],
        message: `P2P bind port ${config.monerod.p2pBindPort} collides with monerod's ${roles} port inside the container — monerod would fail to start. Choose a different port.`,
      });
    }

    // The active ZMQ pub port must likewise not collide with the RPC ports or
    // the P2P bind port monerod binds inside the container.
    const zmqCollisions = getMonerodZmqPortCollisions(
      config.monerod.zmqPubEnabled,
      config.monerod.zmqPubBindPort,
      config.p2pool.p2PoolMode,
      config.services.isMonitoring,
      config.monerod.p2pBindPort
    );
    if (zmqCollisions.length > 0) {
      const roles = zmqCollisions
        .map((port) => getMonerodCollisionRoleLabel("zmq", port))
        .join(" and ");
      ctx.addIssue({
        code: "custom",
        path: ["monerod", "zmqPubBindPort"],
        message: `ZMQ publisher port ${config.monerod.zmqPubBindPort} collides with monerod's ${roles} port inside the container — monerod would fail to start. Choose a different port.`,
      });
    }
  });

export type FullConfig = z.infer<typeof fullConfigSchema>;
