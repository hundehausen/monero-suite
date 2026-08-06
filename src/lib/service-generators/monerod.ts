import { Service, architectures, networkModes, p2poolModes, torProxyModes, NetworkMode, TorProxyMode, P2PoolMode } from "@/hooks/services/types";
import { TOR_IP, MONEROD_IP } from "@/lib/service-constants";
import {
  safeParse,
  hostListSchema,
  hostPortSchema,
  commandValueSchema,
  pathSchema,
  numericStringSchema,
  signedNumericStringSchema,
  rpcLoginSchema,
  moneroAddressSchema,
} from "@/lib/schemas";
import { DOCKER_IMAGES, MONEROD_PORTS } from "@/lib/constants";
import { getTraefikConfig, getPortBinding, getTorNetworkConfig } from "@/lib/docker-helpers";

/**
 * The port monerod actually binds ZMQ pub to — the single source of truth that
 * consumers (p2pool, monitoring) must connect to. Sanitizes raw input so both
 * producers and consumers resolve the same value for ANY input: non-numeric
 * or out-of-range values fall back to the default ZMQ port. A user-set custom
 * port is honored whenever ZMQ is effectively on — either the user enabled it
 * or the stack (p2pool/monitoring) forces it. Returns null when monerod runs
 * with --no-zmq (neither the stack nor a user-enabled ZMQ needs it).
 */
export const getZmqPubPort = (
  zmqPubEnabled: boolean,
  zmqPubBindPort: string,
  needsZmq: boolean
): number | null => {
  if (zmqPubEnabled || needsZmq) {
    const port = Number(
      safeParse(numericStringSchema, zmqPubBindPort, String(MONEROD_PORTS.zmqPub))
    );
    return Number.isInteger(port) && port >= 1 && port <= 65535
      ? port
      : MONEROD_PORTS.zmqPub;
  }
  return null;
};

/**
 * Ports monerod binds inside the container that the P2P bind port must not
 * collide with: the unrestricted RPC port, the restricted RPC port, and the
 * active ZMQ pub port (mirrors getZmqPubPort semantics). Shared by the UI
 * (inline error, install-command gating) and the server-side config schema so
 * client and server reject the same combinations.
 * Returns the occupied ports equal to the effective P2P bind port — empty
 * means no collision. A malformed P2P port falls back to the default (18080).
 */
export const getMonerodP2pPortCollisions = (
  p2pBindPort: string,
  zmqPubEnabled: boolean,
  zmqPubBindPort: string,
  p2PoolMode: P2PoolMode,
  isMonitoring: boolean
): number[] => {
  const effectiveP2pPort = Number(
    safeParse(numericStringSchema, p2pBindPort, String(MONEROD_PORTS.p2p))
  );
  const zmqPubPort = getZmqPubPort(
    zmqPubEnabled,
    zmqPubBindPort,
    p2PoolMode !== p2poolModes.none || isMonitoring
  );
  const occupied: number[] = [MONEROD_PORTS.rpcUnrestricted, MONEROD_PORTS.rpcRestricted];
  if (zmqPubPort !== null) occupied.push(zmqPubPort);
  return [...new Set(occupied.filter((port) => port === effectiveP2pPort))];
};

/**
 * Ports that the active ZMQ pub port must not collide with: the unrestricted
 * RPC port, the restricted RPC port, and the effective P2P bind port (which
 * shares getMonerodP2pPortCollisions's fallback-to-default semantics).
 * Mirrors getZmqPubPort for the active-port resolution: a custom port is
 * honored whenever ZMQ is effectively on (user-enabled or forced by the
 * stack). Returns the occupied ports equal to the active ZMQ port — empty
 * when ZMQ is inactive (monerod runs --no-zmq) or there is no collision.
 */
export const getMonerodZmqPortCollisions = (
  zmqPubEnabled: boolean,
  zmqPubBindPort: string,
  p2PoolMode: P2PoolMode,
  isMonitoring: boolean,
  p2pBindPort: string
): number[] => {
  const zmqPubPort = getZmqPubPort(
    zmqPubEnabled,
    zmqPubBindPort,
    p2PoolMode !== p2poolModes.none || isMonitoring
  );
  if (zmqPubPort === null) return [];
  const effectiveP2pPort = Number(
    safeParse(numericStringSchema, p2pBindPort, String(MONEROD_PORTS.p2p))
  );
  const occupied: number[] = [
    MONEROD_PORTS.rpcUnrestricted,
    MONEROD_PORTS.rpcRestricted,
    effectiveP2pPort,
  ];
  return [...new Set(occupied.filter((port) => port === zmqPubPort))];
};

/**
 * Role of a port monerod binds inside the container, resolved from the
 * direction of a collision helper. Shared by the P2P and ZMQ input errors so
 * each message names the ACTUAL occupied role: the two RPC ports by number,
 * the promoted other side by the input being validated (a port colliding in
 * the P2P direction is the ZMQ publisher, in the ZMQ direction it is the P2P
 * bind port). Returns a role label without a trailing "port".
 */
export const getMonerodCollisionRoleLabel = (
  colliding: "p2p" | "zmq",
  port: number
): string => {
  if (port === MONEROD_PORTS.rpcUnrestricted) return "unrestricted RPC";
  if (port === MONEROD_PORTS.rpcRestricted) return "restricted RPC";
  return colliding === "zmq" ? "P2P" : "ZMQ publisher";
};

interface MonerodDataConfig {
  isMoneroPublicNode: boolean;
  moneroNodeNoLogs: boolean;
  moneroNodeDomain: string;
  isPrunedNode: boolean;
  isSyncPrunedBlocks: boolean;
  isMoneroMainnetVolume: boolean;
  moneroMainnetBlockchainLocation: string;
  logLevel: string;
  maxLogFileSize: string;
  maxLogFiles: string;
  p2pBindPort: string;
  outPeers: string;
  inPeers: string;
  limitRateUp: string;
  limitRateDown: string;
  noIgd: boolean;
  hidePort: boolean;
  allowLocalIp: boolean;
  maxConnectionsPerIp: string;
  p2pExternalPort: string;
  offlineMode: boolean;
  padTransactions: boolean;
  anonymousInbound: string;
  txProxyDisableNoise: boolean;
  banList: string;
  enableDnsBlocklist: boolean;
  dnsCheckpoints: "default" | "skip" | "enforce";
  seedNode: string;
  addPeer: string;
  addPriorityNode: string;
  addExclusiveNode: string;
  dbSyncMode: string;
  blockSyncSize: string;
  fastBlockSync: boolean;
  preparationThreads: string;
  maxConcurrency: string;
  bootstrapDaemonAddress: string;
  bootstrapDaemonLogin: string;
  zmqPubEnabled: boolean;
  zmqPubBindPort: string;
  rpcLogin: string;
  disableRpcBan: boolean;
  maxTxpoolWeight: string;
  startMining: string;
  miningThreads: string;
  bgMiningEnable: boolean;
  bgMiningIgnoreBattery: boolean;
  blockNotify: string;
  reorgNotify: string;
  blockRateNotify: string;
}

export const createMonerodService = (
  state: MonerodDataConfig,
  networkMode: NetworkMode,
  p2PoolMode: P2PoolMode,
  torProxyMode: TorProxyMode,
  isMonitoring: boolean,
  isHiddenServices: boolean,
  isTraefik: boolean,
  certResolverName: string = "monerosuite"
): Service => {
  const {
    isMoneroPublicNode,
    moneroNodeNoLogs,
    moneroNodeDomain,
    isPrunedNode,
    isSyncPrunedBlocks,
    isMoneroMainnetVolume,
    moneroMainnetBlockchainLocation,
    logLevel,
    maxLogFileSize,
    maxLogFiles,
    p2pBindPort,
    outPeers,
    inPeers,
    limitRateUp,
    limitRateDown,
    noIgd,
    hidePort,
    allowLocalIp,
    maxConnectionsPerIp,
    p2pExternalPort,
    offlineMode,
    padTransactions,
    txProxyDisableNoise,
    anonymousInbound,
    banList,
    enableDnsBlocklist,
    dnsCheckpoints,
    seedNode,
    addPeer,
    addPriorityNode,
    addExclusiveNode,
    dbSyncMode,
    blockSyncSize,
    fastBlockSync,
    preparationThreads,
    maxConcurrency,
    bootstrapDaemonAddress,
    bootstrapDaemonLogin,
    zmqPubEnabled,
    zmqPubBindPort,
    rpcLogin,
    disableRpcBan,
    maxTxpoolWeight,
    startMining,
    miningThreads,
    bgMiningEnable,
    bgMiningIgnoreBattery,
    blockNotify,
    reorgNotify,
    blockRateNotify,
  } = state;

  const { labels } = getTraefikConfig(isTraefik, "monerod", moneroNodeDomain, "18089", certResolverName);
  const sPath = safeParse(pathSchema, moneroMainnetBlockchainLocation, "/home/monero/.bitmonero");
  const sBanList = safeParse(commandValueSchema, banList, "");
  const sAnonymousInbound = safeParse(commandValueSchema, anonymousInbound, "");
  const sDbSyncMode = safeParse(commandValueSchema, dbSyncMode, "");
  const sSeedNode = safeParse(hostPortSchema, seedNode, "");
  const sBootstrapAddr = safeParse(hostPortSchema, bootstrapDaemonAddress, "");
  const sBootstrapLogin = safeParse(rpcLoginSchema, bootstrapDaemonLogin, "");
  const sRpcLogin = safeParse(rpcLoginSchema, rpcLogin, "");
  const sBlockNotify = safeParse(commandValueSchema, blockNotify, "");
  const sReorgNotify = safeParse(commandValueSchema, reorgNotify, "");
  const sBlockRateNotify = safeParse(commandValueSchema, blockRateNotify, "");
  const sStartMining = safeParse(moneroAddressSchema, startMining, "");
  const sAddPeer = safeParse(hostListSchema, addPeer ?? "", []);
  const sAddPriorityNode = safeParse(hostListSchema, addPriorityNode ?? "", []);
  const sAddExclusiveNode = safeParse(hostListSchema, addExclusiveNode ?? "", []);
  const sLogLevel = safeParse(numericStringSchema, logLevel, "0");
  const sMaxLogFileSize = safeParse(numericStringSchema, maxLogFileSize, "104850000");
  const sMaxLogFiles = safeParse(numericStringSchema, maxLogFiles, "50");
  const sP2pBindPort = safeParse(numericStringSchema, p2pBindPort, "18080");
  const sOutPeers = safeParse(signedNumericStringSchema, outPeers, "64");
  const sInPeers = safeParse(signedNumericStringSchema, inPeers, "32");
  const sLimitRateUp = safeParse(signedNumericStringSchema, limitRateUp, "1048576");
  const sLimitRateDown = safeParse(signedNumericStringSchema, limitRateDown, "2048");
  const sP2pExternalPort = safeParse(numericStringSchema, p2pExternalPort, "0");
  const sMaxConnectionsPerIp = safeParse(numericStringSchema, maxConnectionsPerIp, "1");
  const sBlockSyncSize = safeParse(numericStringSchema, blockSyncSize, "0");
  const sMaxTxpoolWeight = safeParse(numericStringSchema, maxTxpoolWeight, "0");
  const sPreparationThreads = safeParse(numericStringSchema, preparationThreads, "4");
  const sMaxConcurrency = safeParse(numericStringSchema, maxConcurrency, "0");
  const sMiningThreads = safeParse(numericStringSchema, miningThreads, "1");

  const zmqPubPort = getZmqPubPort(
    zmqPubEnabled,
    zmqPubBindPort,
    p2PoolMode !== p2poolModes.none || isMonitoring
  );

  return {
    name: "Monero Node",
    description:
      "The Monero node (monerod) is the backbone of the network. It validates transactions and blocks, keeps a copy of the blockchain, and helps other nodes stay in sync.",
    checked: true,
    required: true,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    ufw:
      isMoneroPublicNode && networkMode === networkModes.exposed
        ? [`${sP2pBindPort}/tcp`, "18089/tcp"]
        : undefined,
    volumes: isMoneroMainnetVolume
      ? {
        bitmonero: {},
      }
      : undefined,
    code: {
      monerod: {
        image: DOCKER_IMAGES.monerod,
        restart: "unless-stopped",
        container_name: "monerod",
        volumes: [
          ...(isMoneroMainnetVolume
            ? ["bitmonero:/home/monero/.bitmonero"]
            : [`${sPath}:/home/monero/.bitmonero`]),
        ],
        ports: [
          getPortBinding(isMoneroPublicNode ? networkModes.local : networkMode, sP2pBindPort),
          getPortBinding(isMoneroPublicNode ? networkModes.local : networkMode, 18089),
        ],
        depends_on:
          torProxyMode !== torProxyModes.none
            ? {
              tor: {
                condition: "service_started",
              },
            }
            : undefined,
        healthcheck: {
          // Accept 401 so a user-configured --rpc-login (digest auth) doesn't
          // mark the container unhealthy and block depends_on: service_healthy.
          test: `curl -s -o /dev/null -w "%{http_code}" http://localhost:18081/get_height | grep -Eq "^(200|401)$" || exit 1`,
          interval: "60s",
          timeout: "5s",
          retries: 10,
          start_period: "40s",
        },
        ...getTorNetworkConfig(torProxyMode, MONEROD_IP),
        command: [
          "--rpc-restricted-bind-ip=0.0.0.0",
          "--rpc-restricted-bind-port=18089",
          "--rpc-bind-ip=0.0.0.0",
          "--rpc-bind-port=18081",
          "--confirm-external-bind",
          "--check-updates=disabled",
          ...(enableDnsBlocklist ? ["--enable-dns-blocklist"] : []),
          ...(sBanList ? [`--ban-list=${sBanList}`] : []),
          ...(dnsCheckpoints === "enforce" ? ["--enforce-dns-checkpointing"] : []),
          ...(dnsCheckpoints === "skip" ? ["--disable-dns-checkpoints"] : []),
          ...(moneroNodeNoLogs
            ? ["--log-file=/dev/null", "--max-log-file-size=0"]
            : [
              `--log-level=${sLogLevel}`,
              `--max-log-file-size=${sMaxLogFileSize}`,
              `--max-log-files=${sMaxLogFiles}`
            ]),
          ...(noIgd || torProxyMode === torProxyModes.full ? ["--no-igd"] : []),
          ...(hidePort ? ["--hide-my-port"] : []),
          `--p2p-bind-port=${sP2pBindPort}`,
          ...(sP2pExternalPort !== "0" ? [`--p2p-external-port=${sP2pExternalPort}`] : []),
          ...(sOutPeers !== "-1" ? [`--out-peers=${sOutPeers}`] : []),
          ...(sInPeers !== "-1" ? [`--in-peers=${sInPeers}`] : []),
          ...(sLimitRateUp !== "-1" ? [`--limit-rate-up=${sLimitRateUp}`] : []),
          ...(sLimitRateDown !== "-1" ? [`--limit-rate-down=${sLimitRateDown}`] : []),
          ...(allowLocalIp ? ["--allow-local-ip"] : []),
          ...(sMaxConnectionsPerIp !== "1" ? [`--max-connections-per-ip=${sMaxConnectionsPerIp}`] : []),
          ...(isPrunedNode ? ["--prune-blockchain"] : []),
          ...(isSyncPrunedBlocks ? ["--sync-pruned-blocks"] : []),
          ...(offlineMode ? ["--offline"] : []),
          ...(padTransactions ? ["--pad-transactions"] : []),
          ...(sAnonymousInbound ? [`--anonymous-inbound=${sAnonymousInbound}`] : []),
          ...(isMoneroPublicNode ? ["--public-node"] : []),
          ...(sDbSyncMode ? [`--db-sync-mode=${sDbSyncMode}`] : []),
          ...(sBlockSyncSize !== "0" ? [`--block-sync-size=${sBlockSyncSize}`] : []),
          ...(sMaxTxpoolWeight !== "0" ? [`--max-txpool-weight=${sMaxTxpoolWeight}`] : []),
          ...(fastBlockSync ? ["--fast-block-sync=1"] : ["--fast-block-sync=0"]),
          ...(sPreparationThreads !== "4" ? [`--prep-blocks-threads=${sPreparationThreads}`] : []),
          ...(sMaxConcurrency !== "0" ? [`--max-concurrency=${sMaxConcurrency}`] : []),
          ...(sBootstrapAddr ? [`--bootstrap-daemon-address=${sBootstrapAddr}`] : []),
          ...(sBootstrapLogin ? [`--bootstrap-daemon-login=${sBootstrapLogin}`] : []),
          ...(zmqPubPort === null
            ? ["--no-zmq"]
            : [`--zmq-pub=tcp://0.0.0.0:${zmqPubPort}`]),
          ...(sRpcLogin ? [`--rpc-login=${sRpcLogin}`] : []),
          ...(disableRpcBan || isHiddenServices ? ["--disable-rpc-ban"] : []),
          ...(sBlockNotify ? [`--block-notify=${sBlockNotify}`] : []),
          ...(sReorgNotify ? [`--reorg-notify=${sReorgNotify}`] : []),
          ...(sBlockRateNotify ? [`--block-rate-notify=${sBlockRateNotify}`] : []),
          ...(torProxyMode === torProxyModes.full
            ? [`--proxy=${TOR_IP}:9050`]
            : []),
          ...(torProxyMode !== torProxyModes.none
            ? [
              `--tx-proxy=tor,${TOR_IP}:9050,16${txProxyDisableNoise ? ",disable_noise" : ""}`,
              "--add-priority-node=monsterxzzefbr6jq3n2tu4xvlumnunlhbrhqny6naxpn6le3upke2yd.onion:18084",
              "--add-priority-node=doggettffpqokvkukhwquchg6bxwwtgj4pckygqylc7qkhim3ruxncid.onion:18084",
              "--add-priority-node=doggettavnnnctrwm5dv6k42zmtl5f7j2n7sadfmibmnel4cantlf2id.onion:18084",
              "--add-priority-node=5tymba6faziy36md5ffy42vatbjzlye4vyr3gyz6lcvdfximnvwpmwqd.onion:18084",
              "--add-priority-node=plowsof3t5hogddwabaeiyrno25efmzfxyro2vligremt7sxpsclfaid.onion:18083",
              "--add-priority-node=plowsofe6cleftfmk2raiw5h2x66atrik3nja4bfd3zrfa2hdlgworad.onion:18083",
              "--add-peer=monsterxzzefbr6jq3n2tu4xvlumnunlhbrhqny6naxpn6le3upke2yd.onion:18084",
              "--add-peer=doggettffpqokvkukhwquchg6bxwwtgj4pckygqylc7qkhim3ruxncid.onion:18084",
              "--add-peer=doggettavnnnctrwm5dv6k42zmtl5f7j2n7sadfmibmnel4cantlf2id.onion:18084",
              "--add-peer=5tymba6faziy36md5ffy42vatbjzlye4vyr3gyz6lcvdfximnvwpmwqd.onion:18084",
              "--add-peer=plowsofe6cleftfmk2raiw5h2x66atrik3nja4bfd3zrfa2hdlgworad.onion:18083",
              "--add-peer=plowsof3t5hogddwabaeiyrno25efmzfxyro2vligremt7sxpsclfaid.onion:18083",
            ]
            : []),
          ...(sSeedNode ? [`--seed-node=${sSeedNode}`] : []),
          ...sAddPeer.map((host) => `--add-peer=${host}`),
          ...sAddPriorityNode.map((host) => `--add-priority-node=${host}`),
          ...sAddExclusiveNode.map((host) => `--add-exclusive-node=${host}`),
          ...(sStartMining ? [`--start-mining=${sStartMining}`] : []),
          ...(sStartMining && sMiningThreads !== "1" ? [`--mining-threads=${sMiningThreads}`] : []),
          ...(bgMiningEnable ? ["--bg-mining-enable"] : []),
          ...(bgMiningIgnoreBattery ? ["--bg-mining-ignore-battery"] : []),
        ],
        logging: moneroNodeNoLogs ? { driver: "none" } : undefined,
        labels,
      },
    },
  };
};
