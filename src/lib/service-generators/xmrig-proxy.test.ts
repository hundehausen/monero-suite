import { describe, expect, it } from "vitest";
import { createXmrigProxyService, isXmrigProxyEffective } from "./xmrig-proxy";
import { createXmrigService } from "./xmrig";
import { generationCtx } from "./index";
import { architectures, p2poolModes, minigModes } from "@/lib/service-types";
import { P2POOL_PORTS, SERVICE_PORTS } from "@/lib/constants";
import { makeFullConfig } from "@/lib/make-full-config";

const runProxy = (overrides?: Parameters<typeof makeFullConfig>[0]) => {
  const config = makeFullConfig(
    {
      p2pool: { p2PoolMode: p2poolModes.mini },
      services: { isXmrigProxy: true },
    },
    overrides
  );
  return createXmrigProxyService(config, generationCtx(config));
};

describe("xmrig-proxy", () => {
  it("upstreams to the p2pool container stratum and binds 3334", () => {
    const s = runProxy();
    const c = s.code["xmrig-proxy"] as { command: string[]; ports: string[] };
    expect(c.command).toContain("-o");
    expect(c.command).toContain(`p2pool-mini:${P2POOL_PORTS.stratum}`);
    expect(c.command).toContain("--bind");
    expect(c.command).toContain(`0.0.0.0:${SERVICE_PORTS.xmrigProxy}`);
    expect(c.ports).toContain(`${SERVICE_PORTS.xmrigProxy}:${SERVICE_PORTS.xmrigProxy}`);
  });

  it("is amd64-only", () => {
    const s = runProxy({ p2pool: { p2PoolMode: p2poolModes.full } });
    expect(s.architecture).toEqual(["linux/amd64"]);
  });

  it("is unchecked when p2PoolMode is none even if the raw flag is true", () => {
    const s = runProxy({
      p2pool: { p2PoolMode: p2poolModes.none },
      services: { isXmrigProxy: true, isXmrigProxyPublic: true },
    });
    expect(s.checked).toBe(false);
    expect(s.ufw).toBeUndefined();
  });

  it("is checked when p2PoolMode is set and the flag is true", () => {
    const s = runProxy({ p2pool: { p2PoolMode: p2poolModes.full } });
    expect(s.checked).toBe(true);
  });
});

describe("isXmrigProxyEffective", () => {
  it("is true only with the flag, a P2Pool mode, and amd64", () => {
    expect(isXmrigProxyEffective(true, p2poolModes.full, architectures.linuxAmd)).toBe(true);
    expect(isXmrigProxyEffective(true, p2poolModes.none, architectures.linuxAmd)).toBe(false);
    expect(isXmrigProxyEffective(true, p2poolModes.full, architectures.linuxArm)).toBe(false);
    expect(isXmrigProxyEffective(false, p2poolModes.full, architectures.linuxAmd)).toBe(false);
  });
});

describe("xmrig POOL_URL with proxy", () => {
  it("points xmrig at the proxy when the proxy is on", () => {
    const config = makeFullConfig({
      mining: { miningMode: minigModes.xmrig },
      p2pool: { p2PoolMode: p2poolModes.full },
      services: { isXmrigProxy: true },
    });
    const xmrig = createXmrigService(config, generationCtx(config));
    const env = xmrig.code.xmrig.environment as Record<string, string | number>;
    expect(env.POOL_URL).toBe(`xmrig-proxy:${SERVICE_PORTS.xmrigProxy}`);
  });

  it("points xmrig at p2pool when the proxy is off", () => {
    const config = makeFullConfig({
      mining: { miningMode: minigModes.xmrig },
      p2pool: { p2PoolMode: p2poolModes.full },
    });
    const xmrig = createXmrigService(config, generationCtx(config));
    const env = xmrig.code.xmrig.environment as Record<string, string | number>;
    expect(env.POOL_URL).toBe(`p2pool:${P2POOL_PORTS.stratum}`);
  });
});
