// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import XmrigProxySection from "./XmrigProxySection";

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

const xmrigProxyState = {
  isXmrigProxy: true,
  setIsXmrigProxy: () => {},
  isXmrigProxyPublic: false,
  setIsXmrigProxyPublic: () => {},
};

const p2poolState = {
  p2PoolMode: "mini",
};

const architectureState = {
  architecture: "linux/amd64",
};

const networkModeState = {
  networkMode: "local",
  setNetworkMode: () => {},
};

vi.mock("@/hooks/services-context", () => ({
  useServicesContext: () => ({
    services: {
      "xmrig-proxy": {
        description: "Stratum proxy in front of your P2Pool node.",
      },
    },
  }),
  useXmrigProxyState: () => xmrigProxyState,
  useP2PoolState: () => p2poolState,
  useArchitectureState: () => architectureState,
  useNetworkModeState: () => networkModeState,
}));

const renderSection = () =>
  render(
    createElement(
      MantineProvider,
      null,
      createElement(
        Accordion,
        { defaultValue: "xmrig-proxy" },
        createElement(XmrigProxySection)
      )
    )
  );

describe("XmrigProxySection", () => {
  afterEach(() => {
    cleanup();
    xmrigProxyState.isXmrigProxy = true;
    xmrigProxyState.isXmrigProxyPublic = false;
    p2poolState.p2PoolMode = "mini";
    architectureState.architecture = "linux/amd64";
    networkModeState.networkMode = "local";
  });

  it("hides the public-stratum toggle on a local/NAT host", () => {
    networkModeState.networkMode = "local";
    renderSection();

    expect(
      screen.queryByRole("checkbox", { name: /Publish stratum publicly/i })
    ).toBeNull();
  });

  it("shows the public-stratum toggle only on a VPS/exposed host", () => {
    networkModeState.networkMode = "exposed";
    renderSection();

    expect(
      screen.getByRole("checkbox", { name: /Publish stratum publicly/i })
    ).toBeTruthy();
  });
});
