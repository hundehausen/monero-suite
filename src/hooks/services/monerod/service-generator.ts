import { Service, architectures, networkModes, p2poolModes, torProxyModes, NetworkMode, TorProxyMode, P2PoolMode } from "../types";
import { TOR_IP, MONEROD_IP } from "../tor";
import { MonerodState } from "./types";
import {
  safeParse,
  hostListSchema,
  hostPortSchema,
  commandValueSchema,
  pathSchema,
  numericStringSchema,
  rpcLoginSchema,
  moneroAddressSchema,
} from "@/lib/schemas";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTraefikConfig, getPortBinding, getTorNetworkConfig } from "@/lib/docker-helpers";

/**
 * Generates the Monero daemon service configuration
 */
export const createMonerodService = (
  state: MonerodState,
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
    anonymousInbound,
    banList,
    enableDnsBlocklist,
    disableDnsCheckpoints,
    seedNode,
    addPeer,
    addPriorityNode,
    addExclusiveNode,
    dbSyncMode,
    blockSyncSize,
    enforceCheckpointing,
    fastBlockSync,
    preparationThreads,
    maxConcurrency,
    bootstrapDaemonAddress,
    bootstrapDaemonLogin,
    zmqPubEnabled,
    zmqPubBindPort,
    rpcSsl,
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

  // Sanitize user-provided strings before interpolating into Docker commands
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
  const sOutPeers = safeParse(numericStringSchema, outPeers, "64");
  const sInPeers = safeParse(numericStringSchema, inPeers, "32");
  const sLimitRateUp = safeParse(numericStringSchema, limitRateUp, "1048576");
  const sLimitRateDown = safeParse(numericStringSchema, limitRateDown, "2048");
  const sP2pExternalPort = safeParse(numericStringSchema, p2pExternalPort, "0");
  const sMaxConnectionsPerIp = safeParse(numericStringSchema, maxConnectionsPerIp, "1");
  const sZmqPubBindPort = safeParse(numericStringSchema, zmqPubBindPort, "18083");
  const sBlockSyncSize = safeParse(numericStringSchema, blockSyncSize, "0");
  const sMaxTxpoolWeight = safeParse(numericStringSchema, maxTxpoolWeight, "0");
  const sPreparationThreads = safeParse(numericStringSchema, preparationThreads, "4");
  const sMaxConcurrency = safeParse(numericStringSchema, maxConcurrency, "0");
  const sMiningThreads = safeParse(numericStringSchema, miningThreads, "1");

  return {
    name: "Monero Node",
    description:
      "The Monero daemon is the core of the Monero network. It verifies transactions and blocks, and helps other nodes to synchronize.",
    checked: true,
    required: true,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    ufw:
      isMoneroPublicNode && networkMode === networkModes.exposed
        ? ["18080/tcp", "18089/tcp"]
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
          // When node is public, bind to all interfaces regardless of network mode
          getPortBinding(isMoneroPublicNode ? networkModes.local : networkMode, 18080),
          ...(p2PoolMode !== p2poolModes.none
            ? [getPortBinding(isMoneroPublicNode ? networkModes.local : networkMode, 18083)]
            : []),
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
          test: "curl --fail http://localhost:18081/get_height || exit 1",
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
          `--out-peers=${sOutPeers}`,
          `--in-peers=${sInPeers}`,
          ...(sLimitRateUp !== "-1" ? [`--limit-rate-up=${sLimitRateUp}`] : []),
          `--limit-rate-down=${sLimitRateDown}`,
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
          ...(enforceCheckpointing ? ["--enforce-dns-checkpointing"] : []),
          ...(fastBlockSync ? ["--fast-block-sync=1"] : ["--fast-block-sync=0"]),
          ...(sPreparationThreads !== "4" ? [`--prep-blocks-threads=${sPreparationThreads}`] : []),
          ...(sMaxConcurrency !== "0" ? [`--max-concurrency=${sMaxConcurrency}`] : []),
          ...(sBootstrapAddr ? [`--bootstrap-daemon-address=${sBootstrapAddr}`] : []),
          ...(sBootstrapLogin ? [`--bootstrap-daemon-login=${sBootstrapLogin}`] : []),
          ...(zmqPubEnabled
            ? [`--zmq-pub=tcp://0.0.0.0:${sZmqPubBindPort}`]
            : ((p2PoolMode !== p2poolModes.none || isMonitoring)
              ? ["--zmq-pub=tcp://0.0.0.0:18083"]
              : ["--no-zmq"])),
          ...(rpcSsl !== "autodetect" ? [`--rpc-ssl=${rpcSsl}`] : []),
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
              `--tx-proxy=tor,${TOR_IP}:9050,16`,
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
          ...(disableDnsCheckpoints ? ["--disable-dns-checkpoints"] : []),
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
