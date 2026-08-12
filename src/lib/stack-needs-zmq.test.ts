import { describe, expect, it } from "vitest";
import { stackNeedsZmq } from "./stack-needs-zmq";
import { p2poolModes } from "@/hooks/services/types";

describe("stackNeedsZmq", () => {
  it("is false when nothing needs the feed", () => {
    expect(stackNeedsZmq(p2poolModes.none, false, false)).toBe(false);
  });

  it("is true for p2pool, monitoring, or LWS", () => {
    expect(stackNeedsZmq(p2poolModes.mini, false, false)).toBe(true);
    expect(stackNeedsZmq(p2poolModes.none, true, false)).toBe(true);
    expect(stackNeedsZmq(p2poolModes.none, false, true)).toBe(true);
  });
});
