import { Service, NetworkMode, P2PoolMode, TorProxyMode } from "../types";

export interface MonerodState {
  // Basic configuration
  isMoneroPublicNode: boolean;
  setIsMoneroPublicNode: (value: boolean) => void;
  moneroNodeNoLogs: boolean;
  setMoneroNodeNoLogs: (value: boolean) => void;
  moneroNodeDomain: string;
  setMoneroNodeDomain: (value: string) => void;
  isPrunedNode: boolean;
  setIsPrunedNode: (value: boolean) => void;
  isSyncPrunedBlocks: boolean;
  setIsSyncPrunedBlocks: (value: boolean) => void;
  isMoneroMainnetVolume: boolean;
  setIsMoneroMainnetVolume: (value: boolean) => void;
  moneroMainnetBlockchainLocation: string;
  setMoneroMainnetBlockchainLocation: (value: string) => void;

  // Logging configuration
  logLevel: string;
  setLogLevel: (value: string) => void;
  maxLogFileSize: string;
  setMaxLogFileSize: (value: string) => void;
  maxLogFiles: string;
  setMaxLogFiles: (value: string) => void;

  // P2P Network configuration
  p2pBindPort: string;
  setP2pBindPort: (value: string) => void;
  outPeers: string;
  setOutPeers: (value: string) => void;
  inPeers: string;
  setInPeers: (value: string) => void;
  limitRateUp: string;
  setLimitRateUp: (value: string) => void;
  limitRateDown: string;
  setLimitRateDown: (value: string) => void;
  noIgd: boolean;
  setNoIgd: (value: boolean) => void;
  hidePort: boolean;
  setHidePort: (value: boolean) => void;
  allowLocalIp: boolean;
  setAllowLocalIp: (value: boolean) => void;
  maxConnectionsPerIp: string;
  setMaxConnectionsPerIp: (value: string) => void;
  p2pExternalPort: string;
  setP2pExternalPort: (value: string) => void;
  offlineMode: boolean;
  setOfflineMode: (value: boolean) => void;

  // Tor/I2P configuration
  padTransactions: boolean;
  setPadTransactions: (value: boolean) => void;
  anonymousInbound: string;
  setAnonymousInbound: (value: string) => void;
  txProxyDisableNoise: boolean;
  setTxProxyDisableNoise: (value: boolean) => void;

  // Network Security configuration
  banList: string;
  setBanList: (value: string) => void;
  enableDnsBlocklist: boolean;
  setEnableDnsBlocklist: (value: boolean) => void;
  disableDnsCheckpoints: boolean;
  setDisableDnsCheckpoints: (value: boolean) => void;

  // Network Peers configuration
  seedNode: string;
  setSeedNode: (value: string) => void;
  addPeer: string;
  setAddPeer: (value: string) => void;
  addPriorityNode: string;
  setAddPriorityNode: (value: string) => void;
  addExclusiveNode: string;
  setAddExclusiveNode: (value: string) => void;

  // Performance configuration
  dbSyncMode: string;
  setDbSyncMode: (value: string) => void;
  blockSyncSize: string;
  setBlockSyncSize: (value: string) => void;
  enforceCheckpointing: boolean;
  setEnforceCheckpointing: (value: boolean) => void;
  fastBlockSync: boolean;
  setFastBlockSync: (value: boolean) => void;
  preparationThreads: string;
  setPreparationThreads: (value: string) => void;
  maxConcurrency: string;
  setMaxConcurrency: (value: string) => void;
  bootstrapDaemonAddress: string;
  setBootstrapDaemonAddress: (value: string) => void;
  bootstrapDaemonLogin: string;
  setBootstrapDaemonLogin: (value: string) => void;

  // ZMQ and RPC configuration
  zmqPubEnabled: boolean;
  setZmqPubEnabled: (value: boolean) => void;
  zmqPubBindPort: string;
  setZmqPubBindPort: (value: string) => void;
  rpcSsl: string;
  setRpcSsl: (value: string) => void;
  rpcLogin: string;
  setRpcLogin: (value: string) => void;
  disableRpcBan: boolean;
  setDisableRpcBan: (value: boolean) => void;

  // Transaction Pool configuration
  maxTxpoolWeight: string;
  setMaxTxpoolWeight: (value: string) => void;

  // Mining configuration
  startMining: string;
  setStartMining: (value: string) => void;
  miningThreads: string;
  setMiningThreads: (value: string) => void;
  bgMiningEnable: boolean;
  setBgMiningEnable: (value: boolean) => void;
  bgMiningIgnoreBattery: boolean;
  setBgMiningIgnoreBattery: (value: boolean) => void;

  // Notifications configuration
  blockNotify: string;
  setBlockNotify: (value: string) => void;
  reorgNotify: string;
  setReorgNotify: (value: string) => void;
  blockRateNotify: string;
  setBlockRateNotify: (value: string) => void;
}

export interface MonerodServiceHook {
  getMonerodService: (
    networkMode: NetworkMode,
    p2PoolMode: P2PoolMode,
    torProxyMode: TorProxyMode,
    isMonitoring: boolean,
    isHiddenServices: boolean,
    isTraefik: boolean,
    certResolverName?: string
  ) => Service;
  stateFunctions: MonerodState;
}
