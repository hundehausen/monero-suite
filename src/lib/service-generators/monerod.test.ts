import { describe, expect, it } from "vitest";
import {
  createMonerodService,
  getMonerodP2pPortCollisions,
  getMonerodZmqPortCollisions,
  getZmqPubPort,
} from "@/lib/service-generators/monerod";
import { generationCtx } from "@/lib/service-generators";
import { MONEROD_PORTS } from "@/lib/constants";
import { networkModes } from "@/lib/service-types";
import { Service } from "@/lib/service-types";
import { makeFullConfig, type DeepPartial } from "@/lib/make-full-config";
import type { FullConfig } from "@/lib/config-schema";

/**
 * monerod omits peer/rate flags set to -1 so monerod's own defaults apply
 * (fix 5). There is a single source of truth for the generator in
 * src/lib/service-generators/monerod.ts.
 */

type Container = { command?: string[]; ports?: string[] };

const cmd = (c: Container): string[] => c.command ?? [];

const runFull = (
  monerod: DeepPartial<FullConfig["monerod"]> = {},
  opts: {
    networkMode?: FullConfig["networkMode"];
    p2PoolMode?: FullConfig["p2pool"]["p2PoolMode"];
    isMonitoring?: boolean;
    isMoneroLws?: boolean;
  } = {}
): Service => {
  const config = makeFullConfig({
    monerod,
    networkMode: opts.networkMode,
    p2pool: opts.p2PoolMode !== undefined ? { p2PoolMode: opts.p2PoolMode } : undefined,
    services: {
      isMonitoring: opts.isMonitoring,
      isMoneroLws: opts.isMoneroLws,
    },
  });
  return createMonerodService(config, generationCtx(config));
};

const run = (
  monerod: DeepPartial<FullConfig["monerod"]> = {},
  opts: Parameters<typeof runFull>[1] = {}
): string[] => cmd(runFull(monerod, opts).code.monerod as Container);

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

describe("monerod ban-list flag", () => {
  // ghcr.io/sethforprivacy/simple-monerod CMD includes
  // --ban-list=/home/monero/ban_list.txt. Compose `command` replaces CMD,
  // so the generator must pass that path itself unless the user clears it.
  const imageBanListFlag = "--ban-list=/home/monero/ban_list.txt";

  it("emits the image's baked-in ban list path by default", () => {
    expect(run()).toContain(imageBanListFlag);
  });

  it("honors a custom ban list path", () => {
    const flags = run({ banList: "/opt/custom-bans.txt" });
    expect(flags).toContain("--ban-list=/opt/custom-bans.txt");
    expect(flags).not.toContain(imageBanListFlag);
  });

  it("omits --ban-list only when the user clears the path", () => {
    const flags = run({ banList: "" });
    expect(flags.some((a) => a.startsWith("--ban-list="))).toBe(false);
  });

  it("falls back to the image path when the value fails validation", () => {
    expect(run({ banList: "$(rm -rf /)" })).toContain(imageBanListFlag);
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

describe("monerod P2P bind port propagation", () => {
  it("publishes a custom P2P bind port on the host (host = container = selected port)", () => {
    const monerod = runFull({ p2pBindPort: "18085" }).code.monerod as Container;
    expect(monerod.ports).toEqual(["18085:18085", "18089:18089"]);
  });

  it("omits the P2P host mapping in exposed mode for a private node", () => {
    const monerod = runFull({ p2pBindPort: "18085" }, { networkMode: networkModes.exposed })
      .code.monerod as Container;
    expect(monerod.ports).toEqual(["127.0.0.1:18089:18089"]);
  });

  it("still localhost-binds restricted RPC in exposed mode when P2P is omitted", () => {
    const monerod = runFull({}, { networkMode: networkModes.exposed })
      .code.monerod as Container;
    expect(monerod.ports).toEqual(["127.0.0.1:18089:18089"]);
    expect(monerod.ports?.some((p) => p.includes("18080"))).toBe(false);
  });

  it("opens the custom P2P port in the ufw rule for public nodes in exposed mode", () => {
    const service = runFull(
      { isMoneroPublicNode: true, p2pBindPort: "18085" },
      { networkMode: networkModes.exposed }
    );
    expect(service.ufw).toEqual(["18085/tcp", "18089/tcp"]);
    expect((service.code.monerod as Container).ports).toEqual(["18085:18085", "18089:18089"]);
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

describe("monerod ZMQ when monero-lws is enabled", () => {
  it("binds ZMQ RPC and enables ZMQ pub (not --no-zmq)", () => {
    const monerod = runFull({}, { isMoneroLws: true }).code.monerod as Container;
    const command = cmd(monerod);
    expect(command).toContain("--zmq-rpc-bind-ip=0.0.0.0");
    expect(command).toContain(`--zmq-rpc-bind-port=${MONEROD_PORTS.zmqRpc}`);
    expect(command).toContain("--confirm-zmq-rpc-external-bind");
    expect(command.some((a) => a.startsWith("--zmq-pub="))).toBe(true);
    expect(command).not.toContain("--no-zmq");
  });
});

describe("getMonerodZmqPortCollisions", () => {
  it("returns no collision when ZMQ is not active (nothing forces or enables it)", () => {
    expect(getMonerodZmqPortCollisions(false, "18083", "none", false, "18080")).toEqual([]);
    expect(getMonerodZmqPortCollisions(false, "18090", "none", false, "18080")).toEqual([]);
  });

  it("flags the unrestricted and restricted RPC ports monerod binds inside the container", () => {
    expect(getMonerodZmqPortCollisions(true, "18081", "none", false, "18080")).toEqual([18081]);
    expect(getMonerodZmqPortCollisions(true, "18089", "none", false, "18080")).toEqual([18089]);
  });

  it("flags the effective P2P port when ZMQ is enabled on the same port", () => {
    expect(getMonerodZmqPortCollisions(true, "18085", "none", false, "18085")).toEqual([18085]);
  });

  it("honors a custom collision port even when ZMQ is forced on by the stack (regression)", () => {
    expect(getMonerodZmqPortCollisions(false, "18089", "full", false, "18080")).toEqual([18089]);
    expect(getMonerodZmqPortCollisions(false, "18081", "mini", false, "18080")).toEqual([18081]);
    expect(getMonerodZmqPortCollisions(false, "18081", "none", true, "18080")).toEqual([18081]);
  });

  it("falls back to the default ZMQ port on malformed input and flags a collision against it", () => {
    expect(getMonerodZmqPortCollisions(true, "abc", "none", false, "18080")).toEqual([]);
    expect(getMonerodZmqPortCollisions(true, "", "none", false, "18083")).toEqual([18083]);
  });

  it("falls back the effective P2P port to 18080 on malformed P2P input", () => {
    expect(getMonerodZmqPortCollisions(true, "18080", "none", false, "abc")).toEqual([18080]);
  });
});
