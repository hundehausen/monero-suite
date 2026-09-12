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

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverStub,
});

const p2poolState = {
  p2PoolMode: "none",
  setP2PoolMode: () => {},
  p2PoolPayoutAddress: "",
  setP2PoolPayoutAddress: () => {},
  p2PoolMiningThreads: 1,
  setP2PoolMiningThreads: () => {},
  isP2PoolStratumPublic: false,
  setIsP2PoolStratumPublic: () => {},
};

const networkModeState = {
  networkMode: "local",
  setNetworkMode: () => {},
};

vi.mock("@/hooks/services-context", () => ({
  useServicesContext: () => ({
    services: {
      p2pool: {
        description: "Decentralized mining pool.",
      },
    },
  }),
  useP2PoolState: () => p2poolState,
  useXmrigState: () => ({
    miningMode: "none",
    setMiningMode: () => {},
  }),
  useArchitectureState: () => ({
    architecture: "linux/amd64",
  }),
  useNetworkModeState: () => networkModeState,
}));

const renderSection = () =>
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

describe("P2PoolSection", () => {
  afterEach(() => {
    cleanup();
    p2poolState.p2PoolMode = "none";
    p2poolState.isP2PoolStratumPublic = false;
    networkModeState.networkMode = "local";
  });

  it("lists P2Pool networks as radios so the control fits a narrow column", () => {
    renderSection();

    expect(screen.getByRole("radio", { name: "None" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /P2Pool nano/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /P2Pool mini/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /P2Pool full/i })).toBeTruthy();
  });

  it("hides the public-stratum toggle on a local/NAT host", () => {
    p2poolState.p2PoolMode = "mini";
    networkModeState.networkMode = "local";
    renderSection();

    expect(
      screen.queryByRole("checkbox", { name: /Allow external miners/i })
    ).toBeNull();
  });

  it("shows the public-stratum toggle only on a VPS/exposed host", () => {
    p2poolState.p2PoolMode = "mini";
    networkModeState.networkMode = "exposed";
    renderSection();

    expect(
      screen.getByRole("checkbox", { name: /Allow external miners/i })
    ).toBeTruthy();
  });
});
