import { describe, expect, it } from "vitest";
import { createP2PoolService, getP2PoolContainerName } from "./p2pool";
import {
  networkModes,
  p2poolModes,
  torProxyModes,
  P2PoolMode,
  NetworkMode,
} from "@/lib/service-types";
import { P2POOL_PORTS } from "@/lib/constants";

const VALID_ADDRESS =
  "48oc8c65B9JPv6FBZBg7UN9xUYmxux6WfEh61WBoKca7Amh7r7bnCZ7JJicLw7UN3DEgEADwqrhwxGBJazPZ14PJGbmMyXX";

const baseState = {
  p2PoolMode: p2poolModes.full as P2PoolMode,
  p2PoolPayoutAddress: VALID_ADDRESS,
  p2PoolMiningThreads: 4,
  isP2PoolStratumPublic: false,
};

type Container = { ports?: string[] };

const run = (
  stateOverrides: Partial<typeof baseState> = {},
  networkMode: NetworkMode = networkModes.local
) =>
  createP2PoolService(
    { ...baseState, ...stateOverrides } as Parameters<typeof createP2PoolService>[0],
    "none",
    torProxyModes.none,
    networkMode,
    18083
  );

const container = (
  p2PoolMode: P2PoolMode,
  networkMode: NetworkMode,
  isP2PoolStratumPublic: boolean = false
): Container => {
  const service = run({ p2PoolMode, isP2PoolStratumPublic }, networkMode);
  return service.code[getP2PoolContainerName(p2PoolMode)] as unknown as Container;
};

const p2pPortFor = (mode: P2PoolMode): number =>
  mode === p2poolModes.mini
    ? P2POOL_PORTS.p2pMini
    : mode === p2poolModes.nano
      ? P2POOL_PORTS.p2pNano
      : P2POOL_PORTS.p2pFull;

const modes: P2PoolMode[] = [p2poolModes.full, p2poolModes.mini, p2poolModes.nano];

describe("p2pool port publishing", () => {
  it.each(modes)(
    "publishes the P2P port on all interfaces in local mode (%s)",
    (mode) => {
      expect(container(mode, networkModes.local).ports).toEqual([
        `${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}`,
        `${p2pPortFor(mode)}:${p2pPortFor(mode)}`,
      ]);
    }
  );

  it.each(modes)(
    "keeps the P2P port published on all interfaces in exposed mode (%s)",
    (mode) => {
      expect(container(mode, networkModes.exposed).ports).toContain(
        `${p2pPortFor(mode)}:${p2pPortFor(mode)}`
      );
      expect(container(mode, networkModes.exposed).ports).not.toContain(
        `127.0.0.1:${p2pPortFor(mode)}:${p2pPortFor(mode)}`
      );
    }
  );

  it("binds the stratum to localhost when it is not public (exposed mode)", () => {
    expect(container(p2poolModes.full, networkModes.exposed).ports).toEqual([
      `127.0.0.1:${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}`,
      `${P2POOL_PORTS.p2pFull}:${P2POOL_PORTS.p2pFull}`,
    ]);
  });

  it("publishes the stratum on all interfaces when it is public (exposed mode)", () => {
    expect(
      container(p2poolModes.full, networkModes.exposed, true).ports
    ).toEqual([
      `${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}`,
      `${P2POOL_PORTS.p2pFull}:${P2POOL_PORTS.p2pFull}`,
    ]);
  });

  it("keeps the plain stratum binding in local mode whether public or not", () => {
    expect(container(p2poolModes.full, networkModes.local).ports).toContain(
      `${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}`
    );
    expect(container(p2poolModes.full, networkModes.local, true).ports).toContain(
      `${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}`
    );
  });
});

describe("p2pool ufw rules", () => {
  it("opens only the P2P port in exposed mode when the stratum is not public", () => {
    expect(run({}, networkModes.exposed).ufw).toEqual([
      `${P2POOL_PORTS.p2pFull}/tcp`,
    ]);
  });

  it("opens the stratum port in exposed mode when it is public", () => {
    expect(
      run({ isP2PoolStratumPublic: true }, networkModes.exposed).ufw
    ).toEqual([`${P2POOL_PORTS.p2pFull}/tcp`, `${P2POOL_PORTS.stratum}/tcp`]);
  });

  it("adds no ufw rule in local mode", () => {
    expect(run({}, networkModes.local).ufw).toBeUndefined();
    expect(
      run({ isP2PoolStratumPublic: true }, networkModes.local).ufw
    ).toBeUndefined();
  });
});
