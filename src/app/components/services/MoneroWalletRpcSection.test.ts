// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import MoneroWalletRpcSection from "./MoneroWalletRpcSection";

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

const walletRpcState = {
  isMoneroWalletRpc: false,
  setIsMoneroWalletRpc: () => {},
  walletRpcUser: "monero",
  setWalletRpcUser: () => {},
  walletRpcPassword: "changeme",
  setWalletRpcPassword: () => {},
};

vi.mock("@/hooks/services-context", () => ({
  useServicesContext: () => ({
    services: {
      "monero-wallet-rpc": {
        description:
          "Connect external wallets and applications to your node via the Wallet RPC interface.",
      },
    },
  }),
  useMoneroWalletRpcState: () => walletRpcState,
}));

const renderSection = () =>
  render(
    createElement(
      MantineProvider,
      null,
      createElement(
        Accordion,
        { defaultValue: "monero-wallet-rpc" },
        createElement(MoneroWalletRpcSection)
      )
    )
  );

describe("MoneroWalletRpcSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("hides credential fields while wallet-rpc is off", () => {
    walletRpcState.isMoneroWalletRpc = false;
    renderSection();

    expect(
      screen.getByRole("checkbox", { name: "Monero Wallet RPC" })
    ).toBeTruthy();
    expect(document.querySelector('input[type="password"]')).toBeNull();
  });

  it("shows credential fields and a shipped-default warning when wallet-rpc is on", () => {
    walletRpcState.isMoneroWalletRpc = true;
    walletRpcState.walletRpcPassword = "changeme";
    renderSection();

    const password = document.querySelector('input[type="password"]');
    expect(password).toBeInstanceOf(HTMLInputElement);
    if (password instanceof HTMLInputElement) {
      expect(password.value).toBe("changeme");
    }
    expect(screen.getByText("Shipped default password")).toBeTruthy();
  });
});
