import { describe, expect, it } from "vitest";
import { generateBashPreview, generateBashScriptFile, generateScriptSummary } from "./utils";
import { generateInstallationScript } from "@/lib/script-generator";
import { generateAllServices } from "@/lib/service-generators";
import { makeFullConfig } from "@/lib/make-full-config";

describe("generateScriptSummary system packages", () => {
  it("always refreshes indexes and only upgrades when opted in", () => {
    const off = generateScriptSummary([], null, false, "");
    expect(off).toContain("Refresh package indexes");
    expect(off).not.toContain("Upgrade existing system packages");
    expect(off).not.toContain("Update system packages and install dependencies");

    const on = generateScriptSummary([], null, false, "", true);
    expect(on).toContain("Refresh package indexes");
    expect(on).toContain("Upgrade existing system packages");
    expect(on.indexOf("Refresh package indexes")).toBeLessThan(
      on.indexOf("Upgrade existing system packages")
    );
    expect(on.indexOf("Upgrade existing system packages")).toBeLessThan(
      on.indexOf("Install Docker (skipped if already installed)")
    );
  });
});

describe("generateBashPreview system packages", () => {
  const checked = (config = makeFullConfig()) =>
    Object.values(generateAllServices(config)).filter(
      (service) => service.checked !== false && service.checked !== "none"
    );

  it("is empty when the upgrade is off and no service has bash", () => {
    expect(generateBashPreview(checked(), false)).toBe("");
    expect(generateBashScriptFile(checked())).toBe("");
  });

  it("shows the apt and dnf upgrade when opted in, without inlining them as service bash", () => {
    const preview = generateBashPreview(checked(), true);
    expect(preview).toContain("# Upgrade existing system packages");
    expect(preview).toContain("DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l");
    expect(preview).toContain("apt-get upgrade -y");
    expect(preview).toContain("dnf upgrade -y");
    expect(generateBashScriptFile(checked())).toBe("");

    const script = generateInstallationScript(
      "services: {}\n",
      generateBashScriptFile(checked()),
      undefined,
      false,
      "",
      true
    );
    expect(script).toContain("DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l");
    expect(script).toContain("dnf upgrade -y");
    expect(script.match(/apt-get upgrade/g)?.length).toBe(1);
  });

  it("puts the host upgrade above service setup commands", () => {
    const preview = generateBashPreview(
      checked(makeFullConfig({ services: { isMonitoring: true } })),
      true
    );
    expect(preview.indexOf("Upgrade existing system packages")).toBeLessThan(
      preview.indexOf("Set up monitoring configuration")
    );
  });
});
