import { Service, architectures, networkModes, p2poolModes, torProxyModes, NetworkMode } from "../types";
import { TOR_IP, MONEROD_IP } from "../tor";
import { MonerodState } from "./types";

/**
 * Generates the Monero daemon service configuration
 */
export const createMonerodService = (
  state: MonerodState,
  networkMode: NetworkMode,
  p2PoolMode: string,
  torProxyMode: string,
  isMonitoring: boolean,
  isHiddenServices: boolean,
  isTraefik: boolean,
  certResolverName: string = "monerosuite"
): Service => {
  const splitHostsIntoList = (hosts: string | undefined): string[] => {
    if (!hosts) return [];
    return hosts
      .split(/[\s,]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  };
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
        image: "ghcr.io/sethforprivacy/simple-monerod:latest",
        restart: "unless-stopped",
        container_name: "monerod",
        volumes: [
          ...(isMoneroMainnetVolume
            ? ["bitmonero:/home/monero/.bitmonero"]
            : [`${moneroMainnetBlockchainLocation}:/home/monero/.bitmonero`]),
        ],
        ports: [
          ...(isMoneroPublicNode || networkMode === networkModes.local
            ? ["18080:18080"]
            : ["127.0.0.1:18080:18080"]),
          ...(p2PoolMode !== p2poolModes.none
            ? isMoneroPublicNode || networkMode === networkModes.local
              ? ["18084:18084"]
              : ["127.0.0.1:18084:18084"]
            : []),
          ...(isMoneroPublicNode || networkMode === networkModes.local
            ? ["18089:18089"]
            : ["127.0.0.1:18089:18089"]),
        ],
        depends_on:
          torProxyMode !== "none"
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
        // Add network configuration if Tor proxy is enabled
        ...(torProxyMode !== torProxyModes.none
          ? {
              networks: {
                monero_suite_net: {
                  ipv4_address: MONEROD_IP
                }
              }
            }
          : {}),
        command: [
          "--rpc-restricted-bind-ip=0.0.0.0",
          "--rpc-restricted-bind-port=18089",
          "--rpc-bind-ip=0.0.0.0",
          "--rpc-bind-port=18081",
          "--confirm-external-bind",
          "--check-updates=disabled",
          ...(enableDnsBlocklist ? ["--enable-dns-blocklist"] : []),
          ...(banList ? [`--ban-list=${banList}`] : []),
          ...(moneroNodeNoLogs
            ? ["--log-file=/dev/null", "--max-log-file-size=0"]
            : [
                `--log-level=${logLevel}`,
                `--max-log-file-size=${maxLogFileSize}`,
                `--max-log-files=${maxLogFiles}`
              ]),
          ...(noIgd ? ["--no-igd"] : []),
          ...(hidePort ? ["--hide-my-port"] : []),
          `--p2p-bind-port=${p2pBindPort}`,
          ...(p2pExternalPort !== "0" ? [`--p2p-external-port=${p2pExternalPort}`] : []),
          `--out-peers=${outPeers}`,
          `--in-peers=${inPeers}`,
          ...(limitRateUp !== "-1" ? [`--limit-rate-up=${limitRateUp}`] : []),
          `--limit-rate-down=${limitRateDown}`,
          ...(allowLocalIp ? ["--allow-local-ip"] : []),
          ...(maxConnectionsPerIp !== "1" ? [`--max-connections-per-ip=${maxConnectionsPerIp}`] : []),
          ...(isPrunedNode ? ["--prune-blockchain"] : []),
          ...(isSyncPrunedBlocks ? ["--sync-pruned-blocks"] : []),
          ...(offlineMode ? ["--offline"] : []),
          ...(padTransactions ? ["--pad-transactions"] : []),
          ...(anonymousInbound ? [`--anonymous-inbound=${anonymousInbound}`] : []),
          ...(isMoneroPublicNode ? ["--public-node"] : []),
          ...(dbSyncMode ? [`--db-sync-mode=${dbSyncMode}`] : []),
          ...(blockSyncSize !== "0" ? [`--block-sync-size=${blockSyncSize}`] : []),
          ...(maxTxpoolWeight !== "0" ? [`--max-txpool-weight=${maxTxpoolWeight}`] : []),
          ...(enforceCheckpointing ? ["--enforce-dns-checkpointing"] : []),
          ...(fastBlockSync ? ["--fast-block-sync=1"] : ["--fast-block-sync=0"]),
          ...(preparationThreads !== "4" ? [`--prep-blocks-threads=${preparationThreads}`] : []),
          ...(maxConcurrency !== "0" ? [`--max-concurrency=${maxConcurrency}`] : []),
          ...(bootstrapDaemonAddress ? [`--bootstrap-daemon-address=${bootstrapDaemonAddress}`] : []),
          ...(bootstrapDaemonLogin ? [`--bootstrap-daemon-login=${bootstrapDaemonLogin}`] : []),
          ...(zmqPubEnabled 
              ? [`--zmq-pub=tcp://0.0.0.0:${zmqPubBindPort}`] 
              : ((p2PoolMode !== p2poolModes.none || isMonitoring)
                 ? ["--zmq-pub=tcp://0.0.0.0:18084"]
                 : ["--no-zmq"])),
          ...(rpcSsl !== "autodetect" ? [`--rpc-ssl=${rpcSsl}`] : []),
          ...(rpcLogin ? [`--rpc-login=${rpcLogin}`] : []),
          ...(disableRpcBan || isHiddenServices ? ["--disable-rpc-ban"] : []),
          ...(blockNotify ? [`--block-notify=${blockNotify}`] : []),
          ...(reorgNotify ? [`--reorg-notify=${reorgNotify}`] : []),
          ...(blockRateNotify ? [`--block-rate-notify=${blockRateNotify}`] : []),
          ...(torProxyMode === torProxyModes.full
            ? [`--proxy=${TOR_IP}:9050`]
            : []),
          ...(torProxyMode !== torProxyModes.none
            ? [
                `--tx-proxy=tor,${TOR_IP}:9050,32`,
                "--add-priority-node=xwvz3ekocr3dkyxfkmgm2hvbpzx2ysqmaxgter7znnqrhoicygkfswid.onion:18083",
                "--add-priority-node=4pixvbejrvihnkxmduo2agsnmc3rrulrqc7s3cbwwrep6h6hrzsibeqd.onion:18083",
                "--add-priority-node=zbjkbsxc5munw3qusl7j2hpcmikhqocdf4pqhnhtpzw5nt5jrmofptid.onion:18083",
                "--add-priority-node=plowsof3t5hogddwabaeiyrno25efmzfxyro2vligremt7sxpsclfaid.onion:18083",
                "--add-priority-node=plowsoffjexmxalw73tkjmf422gq6575fc7vicuu4javzn2ynnte6tyd.onion:18083",
                "--add-priority-node=qz43zul2x56jexzoqgkx2trzwcfnr6l3hbtfcfx54g4r3eahy3bssjyd.onion:18083",
                "--add-peer=xwvz3ekocr3dkyxfkmgm2hvbpzx2ysqmaxgter7znnqrhoicygkfswid.onion:18083",
                "--add-peer=4pixvbejrvihnkxmduo2agsnmc3rrulrqc7s3cbwwrep6h6hrzsibeqd.onion:18083",
                "--add-peer=zbjkbsxc5munw3qusl7j2hpcmikhqocdf4pqhnhtpzw5nt5jrmofptid.onion:18083",
                "--add-peer=plowsof3t5hogddwabaeiyrno25efmzfxyro2vligremt7sxpsclfaid.onion:18083",
                "--add-peer=plowsoffjexmxalw73tkjmf422gq6575fc7vicuu4javzn2ynnte6tyd.onion:18083",
                "--add-peer=qz43zul2x56jexzoqgkx2trzwcfnr6l3hbtfcfx54g4r3eahy3bssjyd.onion:18083",
              ]
            : []),
          ...(disableDnsCheckpoints ? ["--disable-dns-checkpoints"] : []),
          ...(seedNode ? [`--seed-node=${seedNode}`] : []),
          ...splitHostsIntoList(addPeer).map((host) => `--add-peer=${host}`),
          ...splitHostsIntoList(addPriorityNode).map((host) => `--add-priority-node=${host}`),
          ...splitHostsIntoList(addExclusiveNode).map((host) => `--add-exclusive-node=${host}`),
          ...(startMining ? [`--start-mining=${startMining}`] : []),
          ...(startMining && miningThreads !== "1" ? [`--mining-threads=${miningThreads}`] : []),
          ...(bgMiningEnable ? ["--bg-mining-enable"] : []),
          ...(bgMiningIgnoreBattery ? ["--bg-mining-ignore-battery"] : []),
        ],
        logging: moneroNodeNoLogs ? { driver: "none" } : undefined,
        labels: isTraefik
          ? {
              "traefik.enable": "true",
              "traefik.http.routers.monerod.rule": `Host(\`${moneroNodeDomain}\`)`,
              "traefik.http.routers.monerod.entrypoints": "websecure",
              "traefik.http.routers.monerod.tls.certresolver": certResolverName,
              "traefik.http.services.monerod.loadbalancer.server.port": "18089",
            }
          : undefined,
      },
    },
  };
};
