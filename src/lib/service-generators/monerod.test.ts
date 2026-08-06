import { describe, expect, it } from "vitest";
import {
  createMonerodService,
  getMonerodP2pPortCollisions,
  getZmqPubPort,
} from "@/lib/service-generators/monerod";
import { MONEROD_PORTS } from "@/lib/constants";
import { networkModes, p2poolModes } from "@/hooks/services/types";
import { Service } from "@/hooks/services/types";

/**
 * monerod omits peer/rate flags set to -1 so monerod's own defaults apply
 * (fix 5). There is a single source of truth for the generator in
 * src/lib/service-generators/monerod.ts.
 */

type Container = { command?: string[]; ports?: string[] };

const cmd = (c: Container): string[] => c.command ?? [];

const baseState = {
  // Basic
  isMoneroPublicNode: false,
  moneroNodeNoLogs: false,
  moneroNodeDomain: "node.example.com",
  isPrunedNode: false,
  isSyncPrunedBlocks: false,
  isMoneroMainnetVolume: true,
  moneroMainnetBlockchainLocation: "",
  // Logging
  logLevel: "0",
  maxLogFileSize: "104850000",
  maxLogFiles: "50",
  // P2P
  p2pBindPort: "18080",
  noIgd: false,
  hidePort: false,
  allowLocalIp: false,
  maxConnectionsPerIp: "1",
  p2pExternalPort: "0",
  offlineMode: false,
  // Peers
  outPeers: "64",
  inPeers: "32",
  limitRateUp: "1048576",
  limitRateDown: "2048",
  // Tor/I2P
  padTransactions: false,
  anonymousInbound: "",
  txProxyDisableNoise: false,
  // Network security
  banList: "",
  enableDnsBlocklist: false,
  dnsCheckpoints: "default",
  // Peers
  seedNode: "",
  addPeer: "",
  addPriorityNode: "",
  addExclusiveNode: "",
  // Performance
  dbSyncMode: "",
  blockSyncSize: "0",
  fastBlockSync: true,
  preparationThreads: "4",
  maxConcurrency: "0",
  bootstrapDaemonAddress: "",
  bootstrapDaemonLogin: "",
  // ZMQ/RPC
  zmqPubEnabled: false,
  zmqPubBindPort: "18083",
  rpcLogin: "",
  disableRpcBan: false,
  // Tx pool
  maxTxpoolWeight: "0",
  // Mining
  startMining: "",
  miningThreads: "1",
  bgMiningEnable: false,
  bgMiningIgnoreBattery: false,
  // Notifications
  blockNotify: "",
  reorgNotify: "",
  blockRateNotify: "",
};

type PeerOverrides = Partial<typeof baseState> & {
  outPeers?: string;
  inPeers?: string;
  limitRateUp?: string;
  limitRateDown?: string;
};

const run = (overrides: PeerOverrides = {}): string[] =>
  cmd(
    (
      createMonerodService(
        { ...baseState, ...overrides } as Parameters<typeof createMonerodService>[0],
        networkModes.local,
        "none",
        "none",
        false,
        false,
        false
      ) as Service
    ).code.monerod as Container
  );

const peerFlags = (c: string[]) =>
  c.filter(
    (a) =>
      a.startsWith("--out-peers") ||
      a.startsWith("--in-peers") ||
      a.startsWith("--limit-rate-up") ||
      a.startsWith("--limit-rate-down")
  );

describe("monerod peer/rate flags", () => {
  it("omits all peer/rate flags when set to -1 (use monerod default)", () => {
    const flags = peerFlags(
      run({ outPeers: "-1", inPeers: "-1", limitRateUp: "-1", limitRateDown: "-1" })
    );
    expect(flags).toEqual([]);
  });

  it("emits the flags verbatim for explicit values", () => {
    const flags = peerFlags(
      run({ outPeers: "32", inPeers: "48", limitRateUp: "8192", limitRateDown: "32768" })
    );
    expect(flags).toEqual([
      "--out-peers=32",
      "--in-peers=48",
      "--limit-rate-up=8192",
      "--limit-rate-down=32768",
    ]);
  });

  it("emits the flags for the default values (no -1)", () => {
    const flags = peerFlags(
      run({ outPeers: "64", inPeers: "32", limitRateUp: "1048576", limitRateDown: "2048" })
    );
    expect(flags).toEqual([
      "--out-peers=64",
      "--in-peers=32",
      "--limit-rate-up=1048576",
      "--limit-rate-down=2048",
    ]);
  });
});

describe("monerod DNS checkpoint flags (fix 6)", () => {
  it("emits neither flag for the default mode", () => {
    const flags = run({ dnsCheckpoints: "default" });
    expect(flags).not.toContain("--disable-dns-checkpoints");
    expect(flags).not.toContain("--enforce-dns-checkpointing");
  });

  it("emits only --disable-dns-checkpoints for skip", () => {
    const flags = run({ dnsCheckpoints: "skip" });
    expect(flags).toContain("--disable-dns-checkpoints");
    expect(flags).not.toContain("--enforce-dns-checkpointing");
  });

  it("emits only --enforce-dns-checkpointing for enforce", () => {
    const flags = run({ dnsCheckpoints: "enforce" });
    expect(flags).toContain("--enforce-dns-checkpointing");
    expect(flags).not.toContain("--disable-dns-checkpoints");
  });
});

describe("getZmqPubPort", () => {
  it("returns the custom port when ZMQ pub is enabled", () => {
    expect(getZmqPubPort(true, "18090", false)).toBe(18090);
  });

  it("falls back to the default ZMQ port for malformed or out-of-range values", () => {
    for (const bad of ["abc", "", "0", "65536", "-5"]) {
      expect(getZmqPubPort(true, bad, false), `input ${JSON.stringify(bad)}`).toBe(
        MONEROD_PORTS.zmqPub
      );
    }
  });

  it("returns the custom port when the stack forces ZMQ on (p2pool/monitoring)", () => {
    expect(getZmqPubPort(false, "18090", true)).toBe(18090);
  });

  it("falls back to the default ZMQ port for malformed or out-of-range values when the stack forces ZMQ on", () => {
    for (const bad of ["abc", "", "0", "65536", "-5"]) {
      expect(getZmqPubPort(false, bad, true), `input ${JSON.stringify(bad)}`).toBe(
        MONEROD_PORTS.zmqPub
      );
    }
  });

  it("binds the default port when the stack needs ZMQ and the user did not customize it", () => {
    expect(getZmqPubPort(false, "18083", true)).toBe(MONEROD_PORTS.zmqPub);
  });

  it("returns null when nothing needs ZMQ (monerod runs --no-zmq)", () => {
    expect(getZmqPubPort(false, "18083", false)).toBeNull();
  });
});

const runFull = (
  overrides: Partial<typeof baseState> = {},
  opts: { networkMode?: (typeof networkModes)[keyof typeof networkModes]; p2PoolMode?: (typeof p2poolModes)[keyof typeof p2poolModes]; isMonitoring?: boolean } = {}
): Service =>
  createMonerodService(
    { ...baseState, ...overrides } as Parameters<typeof createMonerodService>[0],
    opts.networkMode ?? networkModes.local,
    opts.p2PoolMode ?? p2poolModes.none,
    "none",
    opts.isMonitoring ?? false,
    false,
    false
  ) as Service;

describe("monerod P2P bind port propagation", () => {
  it("publishes a custom P2P bind port on the host (host = container = selected port)", () => {
    const monerod = runFull({ p2pBindPort: "18085" }).code.monerod as Container;
    expect(monerod.ports).toEqual(["18085:18085", "18089:18089"]);
  });

  it("localhost-prefixes the custom P2P binding in exposed mode", () => {
    const monerod = runFull({ p2pBindPort: "18085" }, { networkMode: networkModes.exposed })
      .code.monerod as Container;
    expect(monerod.ports).toEqual(["127.0.0.1:18085:18085", "127.0.0.1:18089:18089"]);
  });

  it("opens the custom P2P port in the ufw rule for public nodes in exposed mode", () => {
    const service = runFull(
      { isMoneroPublicNode: true, p2pBindPort: "18085" },
      { networkMode: networkModes.exposed }
    );
    expect(service.ufw).toEqual(["18085/tcp", "18089/tcp"]);
  });

  it("keeps the default 18080 binding and ufw rule when the port is untouched", () => {
    const service = runFull(
      { isMoneroPublicNode: true },
      { networkMode: networkModes.exposed }
    );
    const monerod = service.code.monerod as Container;
    expect(monerod.ports).toEqual(["18080:18080", "18089:18089"]);
    expect(service.ufw).toEqual(["18080/tcp", "18089/tcp"]);
  });
});

describe("getMonerodP2pPortCollisions", () => {
  it("flags the unrestricted and restricted RPC ports monerod binds inside the container", () => {
    expect(getMonerodP2pPortCollisions("18081", false, "18083", "none", false)).toEqual([18081]);
    expect(getMonerodP2pPortCollisions("18089", false, "18083", "none", false)).toEqual([18089]);
  });

  it("flags the active ZMQ port when the user enabled ZMQ on a custom port", () => {
    expect(getMonerodP2pPortCollisions("18090", true, "18090", "none", false)).toEqual([18090]);
  });

  it("flags the default ZMQ port when the stack needs ZMQ (p2pool or monitoring)", () => {
    expect(getMonerodP2pPortCollisions("18083", false, "18083", "mini", false)).toEqual([18083]);
    expect(getMonerodP2pPortCollisions("18083", false, "18083", "full", false)).toEqual([18083]);
    expect(getMonerodP2pPortCollisions("18083", false, "18083", "none", true)).toEqual([18083]);
  });

  it("ignores the user's ZMQ port when ZMQ is effectively off", () => {
    expect(getMonerodP2pPortCollisions("18083", false, "18083", "none", false)).toEqual([]);
    expect(getMonerodP2pPortCollisions("18090", false, "18090", "none", false)).toEqual([]);
  });

  it("honors the user's custom ZMQ port when the stack needs ZMQ but the toggle is off", () => {
    expect(getMonerodP2pPortCollisions("18090", false, "18090", "full", false)).toEqual([18090]);
  });

  it("returns no collision for a malformed p2p port (falls back to the default 18080)", () => {
    expect(getMonerodP2pPortCollisions("abc", false, "18083", "none", false)).toEqual([]);
    expect(getMonerodP2pPortCollisions("", false, "18083", "none", false)).toEqual([]);
  });
});
