// @vitest-environment jsdom
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import MonitoringSection from "./MonitoringSection";

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
      monitoring: {
        description:
          "Visualize your node's performance with Grafana dashboards.",
      },
    },
  }),
  useMonitoringState: () => ({
    isMonitoring: false,
    setIsMonitoring: () => {},
    grafanaDomain: "localhost:3000",
    setGrafanaDomain: () => {},
  }),
}));

describe("MonitoringSection", () => {
  it("shows the enable checkbox and does not claim amd64-only", () => {
    render(
      createElement(
        MantineProvider,
        null,
        createElement(
          Accordion,
          { defaultValue: "monitoring" },
          createElement(MonitoringSection)
        )
      )
    );

    expect(
      screen.getByRole("checkbox", { name: "Enable Monitoring" })
    ).toBeTruthy();
    expect(screen.queryByText(/only available on/i)).toBeNull();
  });
});
