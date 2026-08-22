import { describe, expect, it } from "vitest";
import { fullConfigSchema, monerodConfigSchema } from "./config-schema";
import { makeFullConfig } from "./make-full-config";
import { pickConfigGroup } from "./pick-config-group";

describe("pickConfigGroup", () => {
  it("keeps schema keys and drops setters", () => {
    const monerod = makeFullConfig().monerod;
    const picked = pickConfigGroup(
      { ...monerod, setP2pBindPort: () => {} },
      monerodConfigSchema
    );
    expect(picked).toEqual(monerod);
    expect(picked).not.toHaveProperty("setP2pBindPort");
    expect(fullConfigSchema.safeParse(makeFullConfig({ monerod: picked })).success).toBe(true);
  });

  it("rejects a source missing a schema key", () => {
    const monerod = makeFullConfig().monerod;
    const missing = { ...monerod } as Omit<typeof monerod, "p2pBindPort">;
    delete (missing as { p2pBindPort?: string }).p2pBindPort;
    // @ts-expect-error source must include every schema key
    pickConfigGroup(missing, monerodConfigSchema);
  });
});
