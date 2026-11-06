// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import MoneroLwsSection from "./MoneroLwsSection";

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

const lwsState = {
  isMoneroLws: false,
  setIsMoneroLws: () => {},
  lwsDomain: "lws.example.com",
  setLwsDomain: () => {},
};

const services: Record<string, { description: string }> = {};

vi.mock("@/hooks/services-context", () => ({
  useServicesContext: () => ({ services }),
  useMoneroLwsState: () => lwsState,
}));

const renderSection = () =>
  render(
    createElement(
      MantineProvider,
      null,
      createElement(
        Accordion,
        { defaultValue: "monero-lws" },
        createElement(MoneroLwsSection)
      )
    )
  );

describe("MoneroLwsSection", () => {
  afterEach(() => {
    cleanup();
    delete services["monero-lws"];
  });

  it("renders nothing when the architecture filter drops the service", () => {
    // filterServicesByArchitecture removes monero-lws on arm64.
    expect(() => renderSection()).not.toThrow();
    expect(screen.queryByText("Enable monero-lws")).toBeNull();
    expect(screen.queryByText("Light Wallet Server")).toBeNull();
  });

  it("shows the checkbox and description when the service is available", () => {
    services["monero-lws"] = { description: "Scan view keys on your own node." };
    renderSection();

    expect(screen.getByText("Scan view keys on your own node.")).toBeTruthy();
    expect(
      screen.getByRole("checkbox", { name: "Enable monero-lws" })
    ).toBeTruthy();
  });
});
