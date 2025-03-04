import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import {
  Service,
  architectures,
  networkModes,
  p2poolModes,
  torProxyModes,
  NetworkMode,
} from "./types";
import { TOR_IP, MONEROD_IP } from "./tor";

export const useMonerodService = () => {
  const [isMoneroPublicNode, setIsMoneroPublicNode] = useQueryState(
    "isMoneroPublicNode",
    parseAsBoolean.withDefault(true)
  );
  const [moneroNodeNoLogs, setMoneroNodeNoLogs] = useQueryState(
    "moneroNodeNoLogs",
    parseAsBoolean.withDefault(false)
  );
  const [moneroNodeDomain, setMoneroNodeDomain] = useQueryState(
    "moneroNodeDomain",
    parseAsString.withDefault("node.monerosuite.org")
  );
  const [isPrunedNode, setIsPrunedNode] = useQueryState(
    "isPrunedNode",
    parseAsBoolean.withDefault(false)
  );
  const [isSyncPrunedBlocks, setIsSyncPrunedBlocks] = useQueryState(
    "isSyncPrunedBlocks",
    parseAsBoolean.withDefault(false)
  );
  const [isMoneroMainnetVolume, setIsMoneroMainnetVolume] = useQueryState(
    "isMoneroMainnetVolume",
    parseAsBoolean.withDefault(true)
  );
  const [moneroMainnetBlockchainLocation, setMoneroMainnetBlockchainLocation] =
    useQueryState(
      "moneroMainnetBlockchainLocation",
      parseAsString.withDefault("~/.bitmonero")
    );

  // Advanced configuration options
  // Logging
  const [logLevel, setLogLevel] = useQueryState(
    "logLevel", 
    parseAsString.withDefault("0")
  );
  const [maxLogFileSize, setMaxLogFileSize] = useQueryState(
    "maxLogFileSize", 
    parseAsString.withDefault("1048576")
  );
  const [maxLogFiles, setMaxLogFiles] = useQueryState(
    "maxLogFiles", 
    parseAsString.withDefault("3")
  );
  
  // P2P Network
  const [p2pBindPort, setP2pBindPort] = useQueryState(
    "p2pBindPort", 
    parseAsString.withDefault("18080")
  );
  const [outPeers, setOutPeers] = useQueryState(
    "outPeers", 
    parseAsString.withDefault("32")
  );
  const [inPeers, setInPeers] = useQueryState(
    "inPeers", 
    parseAsString.withDefault("48")
  );
  const [limitRateUp, setLimitRateUp] = useQueryState(
    "limitRateUp", 
    parseAsString.withDefault("1048576")
  );
  const [limitRateDown, setLimitRateDown] = useQueryState(
    "limitRateDown", 
    parseAsString.withDefault("1048576")
  );
  const [noIgd, setNoIgd] = useQueryState(
    "noIgd", 
    parseAsBoolean.withDefault(true)
  );
  const [hidePort, setHidePort] = useQueryState(
    "hidePort", 
    parseAsBoolean.withDefault(false)
  );
  const [allowLocalIp, setAllowLocalIp] = useQueryState(
    "allowLocalIp",
    parseAsBoolean.withDefault(false)
  );
  const [maxConnectionsPerIp, setMaxConnectionsPerIp] = useQueryState(
    "maxConnectionsPerIp",
    parseAsString.withDefault("1")
  );
  const [p2pExternalPort, setP2pExternalPort] = useQueryState(
    "p2pExternalPort",
    parseAsString.withDefault("0")
  );
  const [offlineMode, setOfflineMode] = useQueryState(
    "offlineMode",
    parseAsBoolean.withDefault(false)
  );
  
  // Tor/I2P
  const [padTransactions, setPadTransactions] = useQueryState(
    "padTransactions",
    parseAsBoolean.withDefault(false)
  );
  const [anonymousInbound, setAnonymousInbound] = useQueryState(
    "anonymousInbound",
    parseAsString.withDefault("")
  );
  
  // Network Security
  const [banList, setBanList] = useQueryState(
    "banList",
    parseAsString.withDefault("")
  );
  const [enableDnsBlocklist, setEnableDnsBlocklist] = useQueryState(
    "enableDnsBlocklist",
    parseAsBoolean.withDefault(true)
  );
  const [disableDnsCheckpoints, setDisableDnsCheckpoints] = useQueryState(
    "disableDnsCheckpoints",
    parseAsBoolean.withDefault(false)
  );
  
  // Network Peers
  const [seedNode, setSeedNode] = useQueryState(
    "seedNode",
    parseAsString.withDefault("")
  );
  const [addPeer, setAddPeer] = useQueryState(
    "addPeer",
    parseAsString.withDefault("")
  );
  const [addPriorityNode, setAddPriorityNode] = useQueryState(
    "addPriorityNode",
    parseAsString.withDefault("")
  );
  const [addExclusiveNode, setAddExclusiveNode] = useQueryState(
    "addExclusiveNode",
    parseAsString.withDefault("")
  );
  
  // Performance
  const [dbSyncMode, setDbSyncMode] = useQueryState(
    "dbSyncMode", 
    parseAsString.withDefault("fast:async:250000000bytes")
  );
  const [blockSyncSize, setBlockSyncSize] = useQueryState(
    "blockSyncSize", 
    parseAsString.withDefault("0")
  );
  const [enforceCheckpointing, setEnforceCheckpointing] = useQueryState(
    "enforceCheckpointing", 
    parseAsBoolean.withDefault(false)
  );
  const [fastBlockSync, setFastBlockSync] = useQueryState(
    "fastBlockSync", 
    parseAsBoolean.withDefault(true)
  );
  const [preparationThreads, setPreparationThreads] = useQueryState(
    "preparationThreads", 
    parseAsString.withDefault("4")
  );
  const [maxConcurrency, setMaxConcurrency] = useQueryState(
    "maxConcurrency", 
    parseAsString.withDefault("0")
  );
  const [bootstrapDaemonAddress, setBootstrapDaemonAddress] = useQueryState(
    "bootstrapDaemonAddress",
    parseAsString.withDefault("")
  );
  const [bootstrapDaemonLogin, setBootstrapDaemonLogin] = useQueryState(
    "bootstrapDaemonLogin",
    parseAsString.withDefault("")
  );
  
  // ZMQ and RPC
  const [zmqPubEnabled, setZmqPubEnabled] = useQueryState(
    "zmqPubEnabled", 
    parseAsBoolean.withDefault(false)
  );
  const [zmqPubBindPort, setZmqPubBindPort] = useQueryState(
    "zmqPubBindPort", 
    parseAsString.withDefault("18084")
  );
  const [rpcRestricted, setRpcRestricted] = useQueryState(
    "rpcRestricted", 
    parseAsBoolean.withDefault(true)
  );
  const [rpcSsl, setRpcSsl] = useQueryState(
    "rpcSsl", 
    parseAsString.withDefault("autodetect")
  );
  const [rpcLogin, setRpcLogin] = useQueryState(
    "rpcLogin",
    parseAsString.withDefault("")
  );
  const [disableRpcBan, setDisableRpcBan] = useQueryState(
    "disableRpcBan",
    parseAsBoolean.withDefault(false)
  );
  
  // Transaction Pool
  const [maxTxpoolWeight, setMaxTxpoolWeight] = useQueryState(
    "maxTxpoolWeight",
    parseAsString.withDefault("2684354560")
  );
  
  // Mining
  const [startMining, setStartMining] = useQueryState(
    "startMining",
    parseAsString.withDefault("")
  );
  const [miningThreads, setMiningThreads] = useQueryState(
    "miningThreads",
    parseAsString.withDefault("1")
  );
  const [bgMiningEnable, setBgMiningEnable] = useQueryState(
    "bgMiningEnable",
    parseAsBoolean.withDefault(false)
  );
  const [bgMiningIgnoreBattery, setBgMiningIgnoreBattery] = useQueryState(
    "bgMiningIgnoreBattery",
    parseAsBoolean.withDefault(false)
  );
  
  // Notifications
  const [blockNotify, setBlockNotify] = useQueryState(
    "blockNotify",
    parseAsString.withDefault("")
  );
  const [reorgNotify, setReorgNotify] = useQueryState(
    "reorgNotify",
    parseAsString.withDefault("")
  );
  const [blockRateNotify, setBlockRateNotify] = useQueryState(
    "blockRateNotify",
    parseAsString.withDefault("")
  );

  const getMonerodService = (
    networkMode: NetworkMode,
    p2PoolMode: string,
    torProxyMode: string,
    isMonitoring: boolean,
    isHiddenServices: boolean,
    isTraefik: boolean,
    certResolverName: string = "monerosuite"
  ): Service => ({
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
          ...(rpcRestricted ? ["--restricted-rpc"] : []),
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
          ...(addPeer ? [`--add-peer=${addPeer}`] : []),
          ...(addPriorityNode ? [`--add-priority-node=${addPriorityNode}`] : []),
          ...(addExclusiveNode ? [`--add-exclusive-node=${addExclusiveNode}`] : []),
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
  });

  return {
    getMonerodService,
    stateFunctions: {
      isMoneroPublicNode,
      setIsMoneroPublicNode,
      moneroNodeNoLogs,
      setMoneroNodeNoLogs,
      moneroNodeDomain,
      setMoneroNodeDomain,
      isPrunedNode,
      setIsPrunedNode,
      isSyncPrunedBlocks,
      setIsSyncPrunedBlocks,
      isMoneroMainnetVolume,
      setIsMoneroMainnetVolume,
      moneroMainnetBlockchainLocation,
      setMoneroMainnetBlockchainLocation,
      // Advanced configuration functions
      logLevel,
      setLogLevel,
      maxLogFileSize,
      setMaxLogFileSize,
      maxLogFiles,
      setMaxLogFiles,
      p2pBindPort,
      setP2pBindPort,
      outPeers,
      setOutPeers,
      inPeers,
      setInPeers,
      limitRateUp,
      setLimitRateUp,
      limitRateDown,
      setLimitRateDown,
      dbSyncMode,
      setDbSyncMode,
      blockSyncSize,
      setBlockSyncSize,
      enforceCheckpointing,
      setEnforceCheckpointing,
      fastBlockSync,
      setFastBlockSync,
      preparationThreads,
      setPreparationThreads,
      maxConcurrency,
      setMaxConcurrency,
      zmqPubEnabled,
      setZmqPubEnabled,
      zmqPubBindPort,
      setZmqPubBindPort,
      rpcRestricted,
      setRpcRestricted,
      rpcSsl,
      setRpcSsl,
      rpcLogin,
      setRpcLogin,
      disableRpcBan,
      setDisableRpcBan,
      blockNotify,
      setBlockNotify,
      reorgNotify,
      setReorgNotify,
      blockRateNotify,
      setBlockRateNotify,
      noIgd,
      setNoIgd,
      hidePort,
      setHidePort,
      allowLocalIp,
      setAllowLocalIp,
      maxConnectionsPerIp,
      setMaxConnectionsPerIp,
      p2pExternalPort,
      setP2pExternalPort,
      offlineMode,
      setOfflineMode,
      padTransactions,
      setPadTransactions,
      anonymousInbound,
      setAnonymousInbound,
      maxTxpoolWeight,
      setMaxTxpoolWeight,
      bootstrapDaemonAddress,
      setBootstrapDaemonAddress,
      bootstrapDaemonLogin,
      setBootstrapDaemonLogin,
      banList,
      setBanList,
      enableDnsBlocklist,
      setEnableDnsBlocklist,
      disableDnsCheckpoints,
      setDisableDnsCheckpoints,
      seedNode,
      setSeedNode,
      addPeer,
      setAddPeer,
      addPriorityNode,
      setAddPriorityNode,
      addExclusiveNode,
      setAddExclusiveNode,
      startMining,
      setStartMining,
      miningThreads,
      setMiningThreads,
      bgMiningEnable,
      setBgMiningEnable,
      bgMiningIgnoreBattery,
      setBgMiningIgnoreBattery,
    },
  };
};
