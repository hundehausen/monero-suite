import { describe, expect, it } from "vitest";
import {
  DEFAULT_OPEN_SECTIONS,
  SECTIONS,
  ensureSectionOpen,
  sectionElementId,
} from "./sections";

describe("SECTIONS", () => {
  it("has 15 unique accordion values", () => {
    const values = SECTIONS.map((section) => section.value);
    expect(values).toHaveLength(15);
    expect(new Set(values).size).toBe(15);
  });

  it("default-opens architecture, network mode, and mainnet node", () => {
    expect(DEFAULT_OPEN_SECTIONS).toEqual([
      "architecture",
      "exposed",
      "mainnet-node",
    ]);
    for (const value of DEFAULT_OPEN_SECTIONS) {
      expect(SECTIONS.some((section) => section.value === value)).toBe(true);
    }
  });

  it("indexes Traefik by example.com so leftover domains are searchable", () => {
    const traefik = SECTIONS.find((section) => section.value === "traefik");
    expect(traefik?.description).toMatch(/example\.com/);
    expect(traefik && "keywords" in traefik && traefik.keywords).toContain(
      "example.com"
    );
  });
});

describe("ensureSectionOpen", () => {
  it("appends a collapsed section", () => {
    expect(ensureSectionOpen(["architecture"], "traefik")).toEqual([
      "architecture",
      "traefik",
    ]);
  });

  it("leaves an already-open section in place", () => {
    const open = ["architecture", "traefik"];
    expect(ensureSectionOpen(open, "traefik")).toEqual(open);
    expect(ensureSectionOpen(open, "traefik")).not.toBe(open);
  });
});

describe("sectionElementId", () => {
  it("prefixes accordion values", () => {
    expect(sectionElementId("traefik")).toBe("section-traefik");
  });
});
