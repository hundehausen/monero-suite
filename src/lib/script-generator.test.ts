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

describe("generateInstallationScript docker compose", () => {
  it("runs compose via $SUDO, pull nofail, up fatal", () => {
    const script = sampleScript();

    expect(script).toContain("run_cmd $SUDO docker compose pull &");
    expect(script).toContain('show_spinner $! "Pulling container images" nofail');

    expect(script).toContain("run_cmd $SUDO docker compose up -d &");
    expect(script).toContain('show_spinner $! "Starting Monero Suite containers"');
    // up spinner must NOT pass nofail
    expect(script).not.toMatch(
      /show_spinner \$! "Starting Monero Suite containers" nofail/
    );

    // success message still present (runs only if up did not exit)
    expect(script).toContain("Monero Suite installation completed successfully!");
  });
});

describe("generateInstallationScript home path expansion", () => {
  it("expands ~/ bind-mount sources using SUDO_USER home before starting services", () => {
    const script = sampleScript();

    expect(script).toContain("INSTALL_USER_HOME");
    expect(script).toContain("SUDO_USER");
    expect(script).toMatch(/getent passwd/);
    // sed expands ~/ after a colon or whitespace
    expect(script).toMatch(/sed /);
    expect(script).toContain("docker-compose.yml");
  });
});

describe("generateInstallationScript system package upgrade", () => {
  it("refreshes indexes only by default and does not run pkg_upgrade", () => {
    const script = sampleScript();

    expect(script).toContain('UPGRADE_SYSTEM_PACKAGES="false"');
    expect(script).toContain("$SUDO apt-get update ;;");
    expect(script).toContain("$SUDO dnf makecache ;;");
    expect(script).toContain("$SUDO yum makecache ;;");
    expect(script).not.toMatch(/apt-get update && .*apt-get upgrade/);
    expect(script).toContain('show_spinner $! "Refreshing package indexes"');
    expect(script).toContain('if [ "$UPGRADE_SYSTEM_PACKAGES" = "true" ]; then');
    expect(script).toContain("run_cmd pkg_upgrade &");
  });

  it("emits a noninteractive distro upgrade when upgradeSystemPackages is on", () => {
    const script = generateInstallationScript(
      "services: {}\n",
      "",
      undefined,
      false,
      "",
      true
    );

    expect(script).toContain('UPGRADE_SYSTEM_PACKAGES="true"');
    expect(script).toContain("DEBIAN_FRONTEND=noninteractive");
    expect(script).toContain("NEEDRESTART_MODE=l");
    expect(script).toContain("Dpkg::Options::=--force-confold");
    expect(script).toContain("$SUDO dnf upgrade -y ;;");
    expect(script).toContain('show_spinner $! "Upgrading existing packages"');
  });
});
