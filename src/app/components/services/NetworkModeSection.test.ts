// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import NetworkModeSection from "./NetworkModeSection";

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

const networkModeState = {
  networkMode: "local",
  setNetworkMode: () => {},
};

vi.mock("@/hooks/services-context", () => ({
  useNetworkModeState: () => networkModeState,
}));

const renderSection = () =>
  render(
    createElement(
      MantineProvider,
      null,
      createElement(
        Accordion,
        { defaultValue: "exposed" },
        createElement(NetworkModeSection)
      )
    )
  );

describe("NetworkModeSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("lets NAT/VPS labels wrap instead of overflowing a narrow panel", () => {
    const { container } = renderSection();

    expect(
      screen.getByRole("radio", { name: "Local Network (behind NAT)" })
    ).toBeTruthy();
    expect(
      screen.getByRole("radio", {
        name: "VPS or directly exposed to the internet",
      })
    ).toBeTruthy();

    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("data-full-width")).toBe("true");

    const labels = container.querySelectorAll(".mantine-SegmentedControl-label");
    expect(labels.length).toBe(2);
    for (const label of labels) {
      expect(label).toHaveProperty("style");
      expect((label as HTMLElement).style.whiteSpace).toBe("normal");
    }

    const inner = container.querySelectorAll(
      ".mantine-SegmentedControl-innerLabel"
    );
    expect(inner.length).toBe(2);
    for (const el of inner) {
      expect((el as HTMLElement).style.overflowWrap).toBe("break-word");
      expect((el as HTMLElement).style.whiteSpace).toBe("normal");
    }
  });
});
