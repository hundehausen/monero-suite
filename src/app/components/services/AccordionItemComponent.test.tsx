// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Accordion, MantineProvider } from "@mantine/core";
import AccordionItemComponent from "./AccordionItemComponent";

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

const renderItem = (props: { checked?: boolean; alwaysOn?: boolean }) =>
  render(
    <MantineProvider>
      <Accordion defaultValue="mainnet-node">
        <AccordionItemComponent
          value="mainnet-node"
          title="Monero Node"
          checked={props.checked}
          alwaysOn={props.alwaysOn}
        >
          body
        </AccordionItemComponent>
      </Accordion>
    </MantineProvider>
  );

describe("AccordionItemComponent", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses the theme orange token for an enabled service border", () => {
    const { container } = renderItem({ checked: true });
    const item = container.querySelector("#section-mainnet-node");
    expect(item).toBeTruthy();
    expect(item?.getAttribute("style") ?? "").toContain(
      "--mantine-color-monero-orange-6"
    );
  });

  it("marks always-on sections with a badge and no enabled border", () => {
    const { container } = renderItem({ alwaysOn: true });
    expect(screen.getByText("Always on")).toBeTruthy();
    const item = container.querySelector("#section-mainnet-node");
    expect(item?.getAttribute("style") ?? "").not.toContain(
      "--mantine-color-monero-orange-6"
    );
  });
});
