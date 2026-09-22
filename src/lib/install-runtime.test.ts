import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  CONFIRM_OVERWRITE_FN,
  RUN_CMD_FN,
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
