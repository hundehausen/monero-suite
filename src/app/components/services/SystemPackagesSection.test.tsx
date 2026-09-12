// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import SystemPackagesSection from "./SystemPackagesSection";

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

const state = {
  upgradeSystemPackages: false,
  setUpgradeSystemPackages: vi.fn(),
};

vi.mock("@/hooks/services-context", () => ({
  useUpgradeSystemPackagesState: () => state,
}));

const renderSection = () =>
  render(
    createElement(
      MantineProvider,
      null,
      createElement(
        Accordion,
        { defaultValue: "system-packages" },
        createElement(SystemPackagesSection)
      )
    )
  );

describe("SystemPackagesSection", () => {
  afterEach(() => {
    cleanup();
    state.upgradeSystemPackages = false;
    state.setUpgradeSystemPackages.mockReset();
  });

  it("renders the opt-in checkbox off by default", () => {
    renderSection();
    const checkbox = screen.getByRole("checkbox", {
      name: "Upgrade existing packages during install",
    });
    expect(checkbox).toHaveProperty("checked", false);
  });

  it("forwards a check to setUpgradeSystemPackages", () => {
    renderSection();
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Upgrade existing packages during install",
      })
    );
    expect(state.setUpgradeSystemPackages).toHaveBeenCalledWith(true);
  });
});
