// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import P2PoolSection from "./P2PoolSection";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

vi.mock("@/hooks/services-context", () => ({
  useServicesContext: () => ({
    services: {
      p2pool: {
        description: "Decentralized mining pool.",
      },
    },
  }),
  useP2PoolState: () => ({
    p2PoolMode: "none",
    setP2PoolMode: () => {},
    p2PoolPayoutAddress: "",
    setP2PoolPayoutAddress: () => {},
    p2PoolMiningThreads: 1,
    setP2PoolMiningThreads: () => {},
    isP2PoolStratumPublic: false,
    setIsP2PoolStratumPublic: () => {},
  }),
  useXmrigState: () => ({
    miningMode: "none",
    setMiningMode: () => {},
  }),
  useArchitectureState: () => ({
    architecture: "linux/amd64",
  }),
}));

describe("P2PoolSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists P2Pool networks as radios so the control fits a narrow column", () => {
    render(
      createElement(
        MantineProvider,
        null,
        createElement(
          Accordion,
          { defaultValue: "p2pool" },
          createElement(P2PoolSection)
        )
      )
    );

    expect(screen.getByRole("radio", { name: "None" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /P2Pool nano/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /P2Pool mini/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /P2Pool full/i })).toBeTruthy();
  });
});
