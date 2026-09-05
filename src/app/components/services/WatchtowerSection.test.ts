// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import WatchtowerSection from "./WatchtowerSection";

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

const watchtowerState = {
  isWatchtower: false,
  setIsWatchtower: () => {},
  watchtowerUpdateFrequency: "hourly",
  setWatchtowerUpdateFrequency: () => {},
  watchtowerCooldownDelay: "24h",
  setWatchtowerCooldownDelay: () => {},
};

vi.mock("@/hooks/services-context", () => ({
  useServicesContext: () => ({
    services: {
      watchtower: {
        description:
          "Automatically updates your Docker containers when new image versions are available.",
      },
    },
  }),
  useWatchtowerState: () => watchtowerState,
}));

const renderSection = () =>
  render(
    createElement(
      MantineProvider,
      null,
      createElement(
        Accordion,
        { defaultValue: "watchtower" },
        createElement(WatchtowerSection)
      )
    )
  );

describe("WatchtowerSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("hides frequency and cooldown controls while Watchtower is off", () => {
    watchtowerState.isWatchtower = false;
    renderSection();

    expect(screen.getByRole("checkbox", { name: "Watchtower" })).toBeTruthy();
    expect(screen.queryByText("Update frequency")).toBeNull();
    expect(screen.queryByText("Image cooldown")).toBeNull();
    expect(screen.queryByRole("radio", { name: "Hourly" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "24h" })).toBeNull();
  });

  it("shows frequency and cooldown options when Watchtower is on", () => {
    watchtowerState.isWatchtower = true;
    renderSection();

    expect(screen.getByText("Update frequency")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Hourly" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Daily" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Weekly" })).toBeTruthy();
    expect(screen.getByText("Image cooldown")).toBeTruthy();
    expect(screen.getByRole("radio", { name: "None" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "12h" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "24h" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "3d" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "7d" })).toBeTruthy();
  });
});
