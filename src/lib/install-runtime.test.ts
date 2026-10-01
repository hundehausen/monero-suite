import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  COMPLETION_TEMPLATE,
  CONFIRM_OVERWRITE_FN,
  DOCKER_INSTALLATION_TEMPLATE,
  ENV_FILE_TEMPLATE,
  PRINT_INSTALL_HEADER_FN,
  PRINT_NEXT_STEPS_FN,
  RUN_COMPOSE_FN,
  RUN_CMD_FN,
  SELINUX_BIND_MOUNTS_FN,
  SETUP_TEMPLATE,
  SUDO_KEEPALIVE_FN,
  WARN_DISK_SPACE_FN,
} from "./bash-templates";

const tempDirs: string[] = [];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "install-runtime-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function writeExec(file: string, body: string) {
  fs.writeFileSync(file, body, { encoding: "utf8", mode: 0o755 });
}

function runBash(
  body: string,
  env: Readonly<Record<string, string>> = {}
): { status: number; output: string } {
  const result = spawnSync("/bin/bash", ["-c", body], {
    encoding: "utf8",
    env: { ...process.env, LANG: "C", ...env },
  });
  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

function runTerminal(body: string, columns = "120") {
  const file = path.join(tempDir(), "terminal.sh");
  writeExec(file, body);
  const result = spawnSync("script", ["-qefc", `bash "${file}"`, "/dev/null"], {
    encoding: "utf8",
    env: { ...process.env, COLUMNS: columns },
  });
  return { status: result.status, output: result.stdout + result.stderr };
}

describe("installer output modes", () => {
  const compose = `
SUDO=""
VERBOSE=false
${RUN_COMPOSE_FN}
docker() { printf '%s\\n' "$*"; }
run_compose pull
`;

  it("uses native Compose progress on a terminal and quiet progress in logs", () => {
    const terminal = runTerminal(compose);
    expect(terminal.status, terminal.output).toBe(0);
    expect(terminal.output).toContain("compose pull");
    expect(terminal.output).not.toContain("--progress quiet");

    const redirected = runBash(compose);
    expect(redirected.status, redirected.output).toBe(0);
    expect(redirected.output).toContain("compose --progress quiet pull");
  });

  it("retains verbose Compose output and propagates errors in quiet mode", () => {
    const verbose = runBash(compose.replace("VERBOSE=false", "VERBOSE=true"));
    expect(verbose.output).toContain("compose pull");
    expect(verbose.output).not.toContain("--progress quiet");

    const failed = runBash(compose.replace(
      `docker() { printf '%s\\n' "$*"; }`,
      `docker() { echo 'registry unavailable' >&2; return 1; }`
    ));
    expect(failed.status, failed.output).toBe(1);
    expect(failed.output).toContain("registry unavailable");
  });

  it("prints static step feedback instead of animation in logs", () => {
    const result = runBash(`
GREEN=; NC=; RED=; YELLOW=; BLUE=; GRAY=; MONERO_ORANGE=
VERBOSE=false
SPINNER=x
${RUN_CMD_FN}
sleep 0.2 &
show_spinner $! 'Test step'
`);
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("[...] Test step\n");
    expect(result.output).toContain("[✓] Test step\n");
    expect(result.output).not.toMatch(/[\r\x1b]/);
  });
});

describe("installation header", () => {
  const body = `
BLUE=; NC=; GRAY=
BANNER='large-banner'
INSTALL_SERVICES='monerod, grafana'
NETWORK_MODE=local
IS_PRUNED_NODE=true
OFFLINE_MODE=false
UPGRADE_SYSTEM_PACKAGES=false
VERBOSE=false
${PRINT_INSTALL_HEADER_FN}
print_install_header
`;

  it("shows the banner only on a terminal wide enough for it", () => {
    const wide = runTerminal(body, "120");
    const narrow = runTerminal(body, "80");
    const redirected = runBash(body);
    expect(wide.output).toContain("large-banner");
    expect(narrow.output).not.toContain("large-banner");
    expect(redirected.output).not.toContain("large-banner");
    for (const result of [wide, narrow, redirected]) {
      expect(result.status, result.output).toBe(0);
      expect(result.output).toContain("Services: monerod, grafana");
      expect(result.output).toContain("Mode: local | Blockchain: pruned");
    }
  });

  it("does not suggest verbose mode when it is already enabled", () => {
    const result = runBash(body.replace("VERBOSE=false", "VERBOSE=true"));
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("Verbose mode enabled");
    expect(result.output).not.toContain("Tip:");
  });
});

describe("confirm_overwrite_install_dir", () => {
  it("is a no-op when the install dir is empty", () => {
    const dir = tempDir();
    const result = runBash(
      `
YELLOW=; NC=; RED=
INSTALL_DIR="${dir}"
${CONFIRM_OVERWRITE_FN}
confirm_overwrite_install_dir
echo OK
`
    );
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("OK");
    expect(result.output).not.toContain("Existing install");
  });

  it("overwrites without a TTY and says so", () => {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, "docker-compose.yml"), "name: x\n");
    const result = runBash(
      `
YELLOW=; NC=; RED=
INSTALL_DIR="${dir}"
OVERWRITE_TTY="${path.join(dir, "missing-tty")}"
${CONFIRM_OVERWRITE_FN}
confirm_overwrite_install_dir
echo OK
`
    );
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("Existing install");
    expect(result.output).toContain("non-interactive");
    expect(result.output).toContain("OK");
  });

  it("continues on Y and aborts on n", () => {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, "docker-compose.yml"), "name: x\n");
    const yesTty = path.join(dir, "yes");
    const noTty = path.join(dir, "no");
    fs.writeFileSync(yesTty, "Y\n");
    fs.writeFileSync(noTty, "n\n");
    fs.chmodSync(yesTty, 0o666);
    fs.chmodSync(noTty, 0o666);

    const yes = runBash(
      `
YELLOW=; NC=; RED=
INSTALL_DIR="${dir}"
OVERWRITE_TTY="${yesTty}"
${CONFIRM_OVERWRITE_FN}
confirm_overwrite_install_dir
echo OK
`
    );
    expect(yes.status, yes.output).toBe(0);
    expect(yes.output).toContain("OK");

    const no = runBash(
      `
YELLOW=; NC=; RED=
INSTALL_DIR="${dir}"
OVERWRITE_TTY="${noTty}"
${CONFIRM_OVERWRITE_FN}
confirm_overwrite_install_dir
echo OK
`
    );
    expect(no.status).toBe(1);
    expect(no.output).toContain("Aborted");
    expect(no.output).not.toContain("OK");
  });
});

describe("warn_disk_space", () => {
  it("warns when df reports less free space than needed", () => {
    const dir = tempDir();
    const result = runBash(
      `
YELLOW=; NC=; RED=; GREEN=
INSTALL_HOME="${dir}"
df() {
  printf '%s\\n' "Filesystem 1024-blocks Used Available Capacity Mounted on"
  printf '%s\\n' "/dev/loop0 1000000 1 1048576 1% /"
}
${WARN_DISK_SPACE_FN}
warn_disk_space 100 pruned "${dir}"
`
    );
    expect(result.status, result.output).toBe(0);
    expect(result.output).toMatch(/Warning: 1 GiB free/);
    expect(result.output).toContain("will continue");
  });

  it("prints a check when there is enough space", () => {
    const dir = tempDir();
    const result = runBash(
      `
YELLOW=; NC=; RED=; GREEN=
INSTALL_HOME="${dir}"
df() {
  printf '%s\\n' "Filesystem 1024-blocks Used Available Capacity Mounted on"
  printf '%s\\n' "/dev/loop0 1000000000 1 314572800 1% /"
}
${WARN_DISK_SPACE_FN}
warn_disk_space 100 pruned "${dir}"
`
    );
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("Disk space:");
    expect(result.output).not.toContain("Warning:");
  });
});

describe("run_cmd and dump_cmd_log", () => {
  it("keeps command output and prints it on a failing spinner", () => {
    const result = runBash(
      `
GREEN=; NC=; RED=; YELLOW=; BLUE=; GRAY=; MONERO_ORANGE=
SPINNER="x"
VERBOSE=false
${RUN_CMD_FN}
init_cmd_log
run_cmd sh -c 'echo boom-from-cmd >&2; exit 1' &
show_spinner $! "failing step"
echo SHOULD_NOT_PRINT
`
    );
    expect(result.status).toBe(1);
    expect(result.output).toContain("failing step");
    expect(result.output).toContain("boom-from-cmd");
    expect(result.output).toContain("command output");
    expect(result.output).toContain("Re-run with --verbose");
    expect(result.output).not.toContain("SHOULD_NOT_PRINT");
  });
});

describe("configuration failure feedback", () => {
  function runSetup(installDir: string, commands = "", compose = "services: {}") {
    return runBash(`
GREEN=; NC=; RED=; YELLOW=; BLUE=; GRAY=; MONERO_ORANGE=
VERBOSE=false
SPINNER=x
INSTALL_DIR="${installDir}"
INSTALL_HOME="${installDir}"
IS_PRUNED_NODE=false
FULL_DISK_GB=250
BLOCKCHAIN_PATH=""
${RUN_CMD_FN}
${SELINUX_BIND_MOUNTS_FN}
section() { :; }
confirm_overwrite_install_dir() { :; }
warn_disk_space() { :; }
selinux_is_enforcing() { return 1; }
${commands}
${SETUP_TEMPLATE.replace("${DOCKER_COMPOSE_CONTENT}", compose)}
${ENV_FILE_TEMPLATE.replace("${ENV_CONTENT}", "DEMO=value")}
echo SETUP_REACHED_END
}
setup_monero_suite
`);
  }

  it.each(["docker-compose.yml", ".env"])(
    "stops when %s cannot be written without printing a green check",
    (filename) => {
      const dir = tempDir();
      fs.mkdirSync(path.join(dir, filename));
      const result = runSetup(dir);

      expect(result.status, result.output).toBe(1);
      expect(result.output).toContain(`[✗] Writing ${filename}`);
      expect(result.output).not.toContain(`[✓] Writing ${filename}`);
      expect(result.output).not.toContain("SETUP_REACHED_END");
    }
  );

  it("stops when expanding bind-mount paths fails", () => {
    const result = runSetup(
      tempDir(),
      `sed() { echo 'path expansion failed' >&2; return 1; }`,
      "services:\n  app:\n    volumes:\n      - ~/data:/data"
    );

    expect(result.status, result.output).toBe(1);
    expect(result.output).toContain("path expansion failed");
    expect(result.output).toContain("[✗] Expanding ~/ paths");
    expect(result.output).not.toContain("[✓] Expanding ~/ paths");
    expect(result.output).not.toContain("SETUP_REACHED_END");
  });

  it("stops when labeling SELinux bind mounts fails", () => {
    const result = runSetup(
      tempDir(),
      `selinux_is_enforcing() { return 0; }
awk() { echo 'SELinux transform failed' >&2; return 1; }`
    );

    expect(result.status, result.output).toBe(1);
    expect(result.output).toContain("SELinux transform failed");
    expect(result.output).toContain("[✗] Labeling host bind mounts for SELinux");
    expect(result.output).not.toContain("[✓] Labeling host bind mounts for SELinux");
    expect(result.output).not.toContain("SETUP_REACHED_END");
  });

  it("does not report path expansion when no home-relative paths exist", () => {
    const result = runSetup(tempDir());
    expect(result.status, result.output).toBe(0);
    expect(result.output).not.toContain("Expanding ~/ paths");
  });

  it("expands home-relative paths and reports the change", () => {
    const dir = tempDir();
    const result = runSetup(dir, "", "services:\n  app:\n    volumes:\n      - ~/data:/data");
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("[✓] Expanding ~/ paths");
    expect(fs.readFileSync(path.join(dir, "docker-compose.yml"), "utf8"))
      .toContain(`${dir}/data:/data`);
  });
});

describe("completion feedback", () => {
  const nextSteps = PRINT_NEXT_STEPS_FN.replace("__ACCESS_URLS__", "").replace(
    "__SECRET_WARNINGS__",
    ""
  );

  function completionBody(commands: string) {
    return `
GREEN=; NC=; RED=; YELLOW=; BLUE=; GRAY=; MONERO_ORANGE=
SUDO=""
VERBOSE=true
INSTALL_DIR="${tempDir()}"
NETWORK_MODE=local
HAS_HIDDEN_SERVICES=false
OFFLINE_MODE=false
FIREWALL_WARNINGS=()
section() { echo "$1"; }
${nextSteps}
${RUN_COMPOSE_FN}
${commands}
setup_monero_suite() {
${COMPLETION_TEMPLATE}
`;
  }

  it("waits for startup checks before completing and does not claim sync status", () => {
    const result = runBash(completionBody(`
docker() {
    case "$2" in
        up)
            case " $* " in
                *" --wait --wait-timeout 360 "*) echo STARTUP_CHECKS_PASSED ;;
                *) echo 'startup checks missing' >&2; return 1 ;;
            esac
            ;;
    esac
}
`));

    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("STARTUP_CHECKS_PASSED");
    expect(result.output).toContain("Monero Suite installation completed.");
    expect(result.output).toContain("Blockchain sync status was not checked.");
    expect(result.output).not.toContain("not fully synced");
    expect(result.output).not.toContain("completed with warnings");
  });

  it("fails with diagnostics when startup checks fail", () => {
    const result = runBash(completionBody(`
docker() {
    case "$2" in
        up) echo 'container unhealthy' >&2; return 1 ;;
        ps) echo 'monerod restarting' ;;
        logs) echo 'database could not open' ;;
    esac
}
`));

    expect(result.status, result.output).toBe(1);
    expect(result.output).toContain("container unhealthy");
    expect(result.output).toContain("monerod restarting");
    expect(result.output).toContain("database could not open");
    expect(result.output).not.toContain("installation completed");
  });

  it("carries a skipped firewall reason into the final summary", () => {
    const start = DOCKER_INSTALLATION_TEMPLATE.indexOf("warn_firewall() {");
    const end = DOCKER_INSTALLATION_TEMPLATE.indexOf("setup_firewall_ufw() {");
    const result = runBash(completionBody(`
${DOCKER_INSTALLATION_TEMPLATE.slice(start, end)}
docker() { :; }
skip_firewall 'firewalld is installed but not running'
`));

    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("installation completed with warnings");
    expect(result.output).toContain("Needs attention:");
    const summary = result.output.slice(result.output.indexOf("Needs attention:"));
    expect(summary).toContain("firewalld is installed but not running");
    expect(result.output).not.toContain("completed successfully");
  });

  it("reports an image pull failure as a warning when cached images start", () => {
    const result = runBash(completionBody(`
docker() {
    if [ "$2" = pull ]; then
        echo 'registry unavailable' >&2
        return 1
    fi
}
`));

    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("installation completed with warnings");
    expect(result.output).toContain("Needs attention:");
    expect(result.output).toContain("older images already on disk");
  });

  it.each(["ufw", "firewalld"])("reports failed %s rules without claiming full firewall success", (firewall) => {
    const start = DOCKER_INSTALLATION_TEMPLATE.indexOf("fw_cmd() {");
    const end = DOCKER_INSTALLATION_TEMPLATE.indexOf("install_docker() {");
    const result = runBash(completionBody(`
${DOCKER_INSTALLATION_TEMPLATE.slice(start, end)}
docker() { :; }
detect_ssh_ports() { SSH_PORTS=(2222); SSH_SOURCES=test; }
command() {
    if [ "$*" = '-v ufw' ]; then ${firewall === "ufw" ? "return 0" : "return 1"}; fi
    if [ "$*" = '-v firewall-cmd' ]; then return 0; fi
    builtin command "$@"
}
ufw_is_active() { return 0; }
ufw_port_allowed() { return 0; }
ufw_allow_docker_forward() { return 0; }
ufw() {
    if [ "$*" = 'allow 80/tcp' ]; then
        echo 'could not add port rule' >&2
        return 1
    fi
}
firewalld_is_running() { return 0; }
firewall-cmd() {
    if [ "$*" = '--permanent --add-port=80/tcp' ]; then
        echo 'could not add port rule' >&2
        return 1
    fi
}
setup_firewall 80/tcp
`));

    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("installation completed with warnings");
    const summary = result.output.slice(result.output.indexOf("Needs attention:"));
    expect(summary).toContain("80/tcp");
    expect(result.output).not.toContain("[✓] ufw rules updated");
    expect(result.output).not.toContain("[✓] Firewall configured successfully");
  });
});

describe("Docker installer download failure", () => {
  it.each([false, true])(
    "reports the download error with verbose=%s instead of a stale command log",
    (verbose) => {
      const dir = tempDir();
      const log = path.join(dir, "command.log");
      fs.writeFileSync(log, "previous package command output\n");
      const start = DOCKER_INSTALLATION_TEMPLATE.indexOf("install_docker() {");
      const end = DOCKER_INSTALLATION_TEMPLATE.indexOf("# Main execution");
      const result = runBash(`
GREEN=; NC=; RED=; YELLOW=; BLUE=; GRAY=; MONERO_ORANGE=
SUDO=""
VERBOSE=${verbose}
SPINNER=x
CMD_LOG="${log}"
${RUN_CMD_FN}
section() { :; }
docker() { return 1; }
curl() { echo 'curl: HTTP 503 from Docker installer' >&2; return 22; }
${DOCKER_INSTALLATION_TEMPLATE.slice(start, end)}
install_docker
`);

      expect(result.status, result.output).toBe(1);
      expect(result.output).toContain("[✗] Downloading Docker install script");
      expect(result.output).toContain("curl: HTTP 503 from Docker installer");
      expect(result.output).not.toContain("previous package command output");
    }
  );
});

describe("sudo keepalive", () => {
  it("refreshes sudo -n on the interval and stops cleanly", () => {
    const dir = tempDir();
    const binDir = path.join(dir, "bin");
    fs.mkdirSync(binDir);
    const stamp = path.join(dir, "sudo-n.log");
    writeExec(
      path.join(binDir, "sudo"),
      `#!/bin/bash
if [ "$1" = "-n" ] && [ "$2" = "true" ]; then
  date +%s >> "${stamp}"
  exit 0
fi
exit 1
`
    );

    const result = runBash(
      `
${SUDO_KEEPALIVE_FN}
SUDO=sudo
start_sudo_keepalive
sleep 2.5
stop_sudo_keepalive
echo STOPPED
`,
      {
        PATH: `${binDir}${path.delimiter}${process.env.PATH ?? "/usr/bin:/bin"}`,
        SUDO_KEEPALIVE_SLEEP: "1",
      }
    );
    expect(result.status, result.output).toBe(0);
    expect(result.output).toContain("STOPPED");
    const lines = fs.existsSync(stamp)
      ? fs.readFileSync(stamp, "utf8").trim().split("\n").filter(Boolean)
      : [];
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });
});
