import { describe, expect, it } from "vitest";
import { createMonerodService as createMonerodServiceLib } from "@/lib/service-generators/monerod";
import { createMonerodService as createMonerodServiceHooks } from "@/hooks/services/monerod/service-generator";
import { networkModes, NetworkMode, P2PoolMode, TorProxyMode, Service } from "@/hooks/services/types";

/**
 * The monerod service is generated from TWO copies of the same logic
 * (src/lib & src/hooks). Both must agree on the -1 "use monerod default"
 * behavior for peer counts and bandwidth limits (fix 5).
 */

type Container = { command?: string[] };
type Generator = (
  state: unknown,
  networkMode: NetworkMode,
  p2PoolMode: P2PoolMode,
  torProxyMode: TorProxyMode,
  isMonitoring: boolean,
  isHiddenServices: boolean,
  isTraefik: boolean
) => Service;

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

const run = (generator: Generator, overrides: PeerOverrides): string[] =>
  cmd(
    (
      generator(
        { ...baseState, ...overrides },
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

const generators: [string, Generator][] = [
  ["lib generator", createMonerodServiceLib as unknown as Generator],
  ["hooks generator", createMonerodServiceHooks as unknown as Generator],
];

describe.each(generators)("%s", (_name, generator) => {
  it("omits all peer/rate flags when set to -1 (use monerod default)", () => {
    const flags = peerFlags(
      run(generator, { outPeers: "-1", inPeers: "-1", limitRateUp: "-1", limitRateDown: "-1" })
    );
    expect(flags).toEqual([]);
  });

  it("emits the flags verbatim for explicit values", () => {
    const flags = peerFlags(
      run(generator, { outPeers: "32", inPeers: "48", limitRateUp: "8192", limitRateDown: "32768" })
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
      run(generator, { outPeers: "64", inPeers: "32", limitRateUp: "1048576", limitRateDown: "2048" })
    );
    expect(flags).toEqual([
      "--out-peers=64",
      "--in-peers=32",
      "--limit-rate-up=1048576",
      "--limit-rate-down=2048",
    ]);
  });
});
