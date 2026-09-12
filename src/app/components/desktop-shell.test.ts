import { describe, expect, it } from "vitest";
import { desktopShellKind } from "./desktop-shell";

describe("desktopShellKind", () => {
  it("keeps the two-column playground when Advanced is closed", () => {
    expect(
      desktopShellKind({ advancedOpened: false, lgUp: true })
    ).toBe("playground");
    expect(
      desktopShellKind({ advancedOpened: false, lgUp: false })
    ).toBe("playground");
  });

  it("uses three columns on lg when Advanced is open", () => {
    expect(
      desktopShellKind({ advancedOpened: true, lgUp: true })
    ).toBe("advanced-3");
  });

  it("uses two columns below lg when Advanced is open", () => {
    expect(
      desktopShellKind({ advancedOpened: true, lgUp: false })
    ).toBe("advanced-2");
  });
});
