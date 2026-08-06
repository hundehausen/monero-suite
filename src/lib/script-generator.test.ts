import { describe, expect, it } from "vitest";
import { generateInstallationScript } from "./script-generator";

function sampleScript() {
  return generateInstallationScript(
    "services: {}\n",
    "",
    undefined,
    false,
    ""
  );
}

describe("generateInstallationScript spinner escapes", () => {
  it("emits printable \\\\r and \\\\033 for bash printf (not raw control bytes)", () => {
    const script = sampleScript();

    // Source must contain backslash-r as two characters
    expect(script).toContain("\\r");
    // Source must contain bash octal ESC escape
    expect(script).toContain("\\033[2K");

    // Must NOT contain raw CR (0x0D) or raw ESC (0x1B) in the spinner clear line
    expect(script.includes("\r")).toBe(false);
    expect(script.includes("\x1b")).toBe(false);
  });
});
