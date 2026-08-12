import { describe, expect, it } from "vitest";
import { createXmrigProxyService } from "./xmrig-proxy";
import { createXmrigService } from "./xmrig";
import { networkModes, p2poolModes, torProxyModes, minigModes } from "@/hooks/services/types";
import { P2POOL_PORTS, SERVICE_PORTS } from "@/lib/constants";

describe("xmrig-proxy", () => {
  it("upstreams to the p2pool container stratum and binds 3334", () => {
    const s = createXmrigProxyService(
      true,
      p2poolModes.mini,
      networkModes.local,
      false,
      torProxyModes.none
    );
    const c = s.code["xmrig-proxy"] as { command: string[]; ports: string[] };
    expect(c.command).toContain("-o");
    expect(c.command).toContain(`p2pool-mini:${P2POOL_PORTS.stratum}`);
    expect(c.command).toContain("--bind");
    expect(c.command).toContain(`0.0.0.0:${SERVICE_PORTS.xmrigProxy}`);
    expect(c.ports).toContain(`${SERVICE_PORTS.xmrigProxy}:${SERVICE_PORTS.xmrigProxy}`);
  });

  it("is amd64-only", () => {
    const s = createXmrigProxyService(true, p2poolModes.full, networkModes.local, false, torProxyModes.none);
    expect(s.architecture).toEqual(["linux/amd64"]);
  });
});

describe("xmrig POOL_URL with proxy", () => {
  it("points xmrig at the proxy when the proxy is on", () => {
    const xmrig = createXmrigService(
      minigModes.xmrig,
      1,
      torProxyModes.none,
      p2poolModes.full,
      true
    );
    expect(xmrig.code.xmrig.environment?.POOL_URL).toBe(
      `xmrig-proxy:${SERVICE_PORTS.xmrigProxy}`
    );
  });

  it("points xmrig at p2pool when the proxy is off", () => {
    const xmrig = createXmrigService(
      minigModes.xmrig,
      1,
      torProxyModes.none,
      p2poolModes.full,
      false
    );
    expect(xmrig.code.xmrig.environment?.POOL_URL).toBe(`p2pool:${P2POOL_PORTS.stratum}`);
  });
});
