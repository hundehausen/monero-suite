import { describe, expect, it } from "vitest";
import { hostPortSchema, hostListSchema, numericStringSchema, signedNumericStringSchema } from "./schemas";
import { fullConfigSchema, FullConfig } from "./config-schema";

describe("hostPortSchema", () => {
  it("accepts host:port as shown in the UI help text", () => {
    expect(hostPortSchema.safeParse("node.example.org:18080").success).toBe(true);
    expect(hostPortSchema.safeParse("peer1.example.org:18089").success).toBe(true);
  });

  it("accepts bare hosts without a port", () => {
    expect(hostPortSchema.safeParse("node.example.org").success).toBe(true);
    expect(hostPortSchema.safeParse("1.2.3.4").success).toBe(true);
  });

  it("accepts onion addresses with and without a port", () => {
    const onion = `${"a".repeat(56)}.onion`;
    expect(hostPortSchema.safeParse(onion).success).toBe(true);
    expect(hostPortSchema.safeParse(`${onion}:18084`).success).toBe(true);
  });

  it("rejects ports out of range", () => {
    expect(hostPortSchema.safeParse("node.example.org:65536").success).toBe(false);
    expect(hostPortSchema.safeParse("node.example.org:99999").success).toBe(false);
  });

  it("rejects non-numeric ports and shell metacharacters", () => {
    expect(hostPortSchema.safeParse("node.example.org:abc").success).toBe(false);
    expect(hostPortSchema.safeParse("node.example.org;rm -rf /").success).toBe(false);
  });
});

describe("hostListSchema", () => {
  it("accepts comma/space-separated host:port entries", () => {
    expect(hostListSchema.safeParse("peer1.example.org:18080,peer2.example.org:18089").success).toBe(true);
    expect(hostListSchema.safeParse("peer1.example.org:18080 peer2.example.org:18080").success).toBe(true);
  });

  it("rejects the whole list if any entry is invalid", () => {
    expect(hostListSchema.safeParse("peer1.example.org:18080,peer2.example.org:notaport").success).toBe(false);
  });
});

describe("numeric schemas", () => {
  it("numericStringSchema rejects -1", () => {
    expect(numericStringSchema.safeParse("-1").success).toBe(false);
  });

  it("signedNumericStringSchema accepts -1", () => {
    expect(signedNumericStringSchema.safeParse("-1").success).toBe(true);
    expect(signedNumericStringSchema.safeParse("32").success).toBe(true);
  });
});

describe("full config server-side validation", () => {
  const baseConfig = (): FullConfig => ({
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
      noIgd: false,
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
      disableDnsCheckpoints: false,
      seedNode: "",
      addPeer: "",
      addPriorityNode: "",
      addExclusiveNode: "",
      dbSyncMode: "",
      blockSyncSize: "0",
      enforceCheckpointing: false,
      fastBlockSync: true,
      preparationThreads: "4",
      maxConcurrency: "0",
      bootstrapDaemonAddress: "",
      bootstrapDaemonLogin: "",
      zmqPubEnabled: false,
      zmqPubBindPort: "18083",
      rpcSsl: "autodetect",
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
    p2pool: { p2PoolMode: "none", p2PoolPayoutAddress: "", p2PoolMiningThreads: 1 },
    mining: { miningMode: "none", xmrigDonateLevel: 1 },
    tor: {
      torProxyMode: "none",
      hsMonerod: false,
      hsMonerodP2P: false,
      hsStagenet: false,
      hsP2Pool: false,
      hsGrafana: false,
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
    },
    enabledBashServices: { monitoring: false, cuprate: false },
  });

  it("accepts host:port for seed node and bootstrap daemon (fix 1)", () => {
    const config = baseConfig();
    config.monerod.seedNode = "node.example.org:18080";
    config.monerod.bootstrapDaemonAddress = "bootstrap.example.org:18089";
    expect(fullConfigSchema.safeParse(config).success).toBe(true);
  });

  it("accepts -1 for peers and rate limits (fix 5)", () => {
    const config = baseConfig();
    config.monerod.outPeers = "-1";
    config.monerod.inPeers = "-1";
    config.monerod.limitRateUp = "-1";
    config.monerod.limitRateDown = "-1";
    expect(fullConfigSchema.safeParse(config).success).toBe(true);
  });
});
