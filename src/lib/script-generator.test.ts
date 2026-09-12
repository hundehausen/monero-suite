import { spawnSync } from "node:child_process";
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

describe("generateInstallationScript SELinux bind mounts", () => {
  it("relabels host binds on enforcing hosts and leaves the embedded compose unlabeled", () => {
    const script = generateInstallationScript(
      "      - ./monitoring/prometheus/config.yaml:/etc/prometheus/config.yaml:ro\n",
      "",
      undefined,
      false,
      ""
    );

    expect(script).toContain("selinux_is_enforcing");
    expect(script).toContain("add_selinux_z_to_bind_mounts");
    expect(script).toContain("Labeling host bind mounts for SELinux");
    expect(script).toContain(
      "./monitoring/prometheus/config.yaml:/etc/prometheus/config.yaml:ro\n"
    );
    expect(script).not.toContain(
      "./monitoring/prometheus/config.yaml:/etc/prometheus/config.yaml:ro,z"
    );
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

describe("generateInstallationScript firewall", () => {
  function exposedScript() {
    return generateInstallationScript(
      "services: {}\n",
      "",
      undefined,
      true,
      "80/tcp 443/tcp"
    );
  }

  it("detects SSH ports without defaulting to 22 or prompting", () => {
    const script = exposedScript();

    expect(script).toContain("detect_ssh_ports");
    expect(script).toContain("SSH_PORTS");
    expect(script).not.toContain("${ssh_port:-22}");
    expect(script).not.toContain("Detected SSH on port");
    expect(script).not.toContain("read -r -p");
    expect(script).toContain("SSH port could not be confirmed");
    expect(script).toContain("Skipping host firewall enable");
    expect(script).toContain("DEFAULT_FORWARD_POLICY");
    expect(script).toContain('NETWORK_MODE="exposed"');
    expect(script).toContain('FIREWALL_PORTS="80/tcp 443/tcp"');
    expect(script).toContain("setup_firewall $FIREWALL_PORTS");
  });

  it("allows SSH before default deny and before ufw enable", () => {
    const script = exposedScript();

    const allowSsh = script.indexOf("Allowing SSH on port");
    const deny = script.indexOf("ufw default deny incoming");
    const enable = script.indexOf("ufw --force enable");
    const rollback = script.indexOf("disabling ufw to avoid lockout");

    expect(allowSsh).toBeGreaterThan(-1);
    expect(deny).toBeGreaterThan(allowSsh);
    expect(enable).toBeGreaterThan(deny);
    expect(rollback).toBeGreaterThan(enable);
  });

  it("keeps firewall setup gated on exposed mode with ports", () => {
    const local = sampleScript();
    expect(local).toContain('NETWORK_MODE="local"');
    expect(local).toContain('FIREWALL_PORTS=""');
    expect(local).toContain(
      'if [ "$NETWORK_MODE" = "exposed" ] && [ -n "${FIREWALL_PORTS:-}" ]; then'
    );
  });

  it("emits bash that parses (bash -n)", () => {
    const script = exposedScript();
    const bashN = spawnSync("bash", ["-n"], { input: script, encoding: "utf8" });
    expect(bashN.status, bashN.stderr || bashN.stdout).toBe(0);
  });
});

