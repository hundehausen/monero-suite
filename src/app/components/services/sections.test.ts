import { describe, expect, it } from "vitest";
import {
  DEFAULT_OPEN_SECTIONS,
  SECTIONS,
  ensureSectionOpen,
  sectionElementId,
} from "./sections";

describe("SECTIONS", () => {
  it("has 16 unique accordion values", () => {
    const values = SECTIONS.map((section) => section.value);
    expect(values).toHaveLength(16);
    expect(new Set(values).size).toBe(16);
  });

  it("lists system-packages after network mode and before the mainnet node", () => {
    const values = SECTIONS.map((section) => section.value);
    expect(values.indexOf("system-packages")).toBe(values.indexOf("exposed") + 1);
    expect(values.indexOf("mainnet-node")).toBe(
      values.indexOf("system-packages") + 1
    );
  });

  it("default-opens architecture, network mode, system packages, and mainnet node", () => {
    expect(DEFAULT_OPEN_SECTIONS).toEqual([
      "architecture",
      "exposed",
      "system-packages",
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
