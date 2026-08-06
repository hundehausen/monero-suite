import { describe, expect, it } from "vitest";
import { createMonerodService, getZmqPubPort } from "@/lib/service-generators/monerod";
import { MONEROD_PORTS } from "@/lib/constants";
import { networkModes } from "@/hooks/services/types";
import { Service } from "@/hooks/services/types";

/**
 * monerod omits peer/rate flags set to -1 so monerod's own defaults apply
 * (fix 5). There is a single source of truth for the generator in
 * src/lib/service-generators/monerod.ts.
 */

type Container = { command?: string[] };

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
  disableDnsCheckpoints: false,
  // Peers
  seedNode: "",
  addPeer: "",
  addPriorityNode: "",
  addExclusiveNode: "",
  // Performance
  dbSyncMode: "",
  blockSyncSize: "0",
  enforceCheckpointing: false,
  fastBlockSync: true,
  preparationThreads: "4",
  maxConcurrency: "0",
  bootstrapDaemonAddress: "",
  bootstrapDaemonLogin: "",
  // ZMQ/RPC
  zmqPubEnabled: false,
  zmqPubBindPort: "18083",
  rpcSsl: "autodetect",
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

  it("binds the default port when the stack needs ZMQ but the user did not customize it", () => {
    expect(getZmqPubPort(false, "18090", true)).toBe(MONEROD_PORTS.zmqPub);
  });

  it("returns null when nothing needs ZMQ (monerod runs --no-zmq)", () => {
    expect(getZmqPubPort(false, "18083", false)).toBeNull();
  });
});
