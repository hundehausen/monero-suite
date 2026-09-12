// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SectionFocusProvider, useSectionFocus } from "./section-focus";
import { sectionElementId } from "./services/sections";

const Probe = ({
  target,
  alsoOpenAdvanced = false,
}: {
  target: string;
  alsoOpenAdvanced?: boolean;
}) => {
  const {
    focusSection,
    openAdvanced,
    accordionItems,
    advancedOpened,
    formOpened,
  } = useSectionFocus();
  return createElement(
    "div",
    null,
    createElement("div", {
      id: sectionElementId(target),
      "data-open": accordionItems.includes(target) ? "true" : "false",
      "data-advanced": advancedOpened ? "true" : "false",
      "data-form": formOpened ? "true" : "false",
    }),
    createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          focusSection(target);
          if (alsoOpenAdvanced) openAdvanced();
        },
      },
      "go"
    )
  );
};

describe("SectionFocusProvider", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const stubMatchMedia = (matches: boolean) => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
  };

  it("opens a section and scrolls it into view", () => {
    stubMatchMedia(true);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    render(
      createElement(
        SectionFocusProvider,
        null,
        createElement(Probe, { target: "traefik" })
      )
    );

    fireEvent.click(screen.getByRole("button", { name: "go" }));

    expect(document.getElementById("section-traefik")?.dataset.open).toBe(
      "true"
    );
    expect(scrollIntoView).toHaveBeenCalled();
    expect(document.getElementById("section-traefik")?.dataset.form).toBe(
      "false"
    );
  });

  it("opens the services drawer when focusing a section below md", () => {
    stubMatchMedia(false);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    Element.prototype.scrollIntoView = vi.fn();

    render(
      createElement(
        SectionFocusProvider,
        null,
        createElement(Probe, { target: "traefik" })
      )
    );

    fireEvent.click(screen.getByRole("button", { name: "go" }));

    expect(document.getElementById("section-traefik")?.dataset.form).toBe(
      "true"
    );
  });

  it("opens advanced config on request", () => {
    stubMatchMedia(true);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    Element.prototype.scrollIntoView = vi.fn();

    render(
      createElement(
        SectionFocusProvider,
        null,
        createElement(Probe, {
          target: "mainnet-node",
          alsoOpenAdvanced: true,
        })
      )
    );

    fireEvent.click(screen.getByRole("button", { name: "go" }));

    expect(
      document.getElementById("section-mainnet-node")?.dataset.advanced
    ).toBe("true");
  });
});
