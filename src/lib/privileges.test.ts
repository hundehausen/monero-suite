import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  CHECK_PRIVILEGES_FN,
  RESOLVE_INSTALL_DIR_FN,
} from "./bash-templates";

const tempDirs: string[] = [];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "privileges-"));
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

function runCheck(opts: {
  euid: string;
  sudoNRc?: number;
  sudoVRc?: number;
  tty?: "missing" | "file";
  sudoOnPath?: boolean;
}): { status: number; output: string; sudo: string } {
  const dir = tempDir();
  const binDir = path.join(dir, "bin");
  fs.mkdirSync(binDir, { recursive: true });

  const sudoOnPath = opts.sudoOnPath !== false;
  if (sudoOnPath) {
    writeExec(
      path.join(binDir, "sudo"),
      `#!/bin/bash
if [ "$1" = "-n" ] && [ "$2" = "true" ]; then
  exit ${opts.sudoNRc ?? 1}
fi
if [ "$1" = "-v" ]; then
  exit ${opts.sudoVRc ?? 1}
fi
exit 1
`
    );
  }

  let sudoTty = "/no/such/sudo-tty";
  if (opts.tty === "file") {
    sudoTty = path.join(dir, "fake-tty");
    fs.writeFileSync(sudoTty, "");
    fs.chmodSync(sudoTty, 0o666);
  }

  const result = spawnSync(
    "/bin/bash",
    [
      "-c",
      `
GREEN=; NC=; RED=; YELLOW=
${CHECK_PRIVILEGES_FN}
check_privileges
printf 'SUDO=%s\\n' "$SUDO"
`,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: sudoOnPath
          ? `${binDir}${path.delimiter}${process.env.PATH ?? "/usr/bin:/bin"}`
          : binDir,
        LANG: "C",
        CHECK_EUID: opts.euid,
        SUDO_TTY: sudoTty,
      },
    }
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const sudoLine = output.split("\n").find((line) => line.startsWith("SUDO="));
  return {
    status: result.status ?? 1,
    output,
    sudo: sudoLine?.slice("SUDO=".length) ?? "",
  };
}

function runInstallDir(opts: {
  idUn: string;
  home?: string;
  sudoUser?: string;
}): { status: number; output: string; dir: string; home: string; user: string } {
  const dir = tempDir();
  const binDir = path.join(dir, "bin");
  fs.mkdirSync(binDir, { recursive: true });

  writeExec(
    path.join(binDir, "id"),
    `#!/bin/bash
[ "$1" = "-un" ] || exit 1
printf '%s\\n' "${opts.idUn}"
`
  );
  writeExec(
    path.join(binDir, "getent"),
    `#!/bin/bash
[ "$1" = "passwd" ] || exit 1
case "$2" in
  root) printf '%s\\n' "root:x:0:0:root:/root:/bin/bash" ;;
  alice) printf '%s\\n' "alice:x:1000:1000:Alice:/home/alice:/bin/bash" ;;
  *) exit 1 ;;
esac
`
  );

  const result = spawnSync(
    "/bin/bash",
    [
      "-c",
      `
GREEN=; NC=; RED=; YELLOW=
${RESOLVE_INSTALL_DIR_FN}
resolve_install_dir
printf 'USER=%s\\n' "$INSTALL_USER"
printf 'HOME=%s\\n' "$INSTALL_HOME"
printf 'DIR=%s\\n' "$INSTALL_DIR"
`,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${binDir}${path.delimiter}${process.env.PATH ?? "/usr/bin:/bin"}`,
        HOME: opts.home ?? "/fallback-home",
        LANG: "C",
        ...(opts.sudoUser ? { SUDO_USER: opts.sudoUser } : {}),
      },
    }
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const pick = (prefix: string) =>
    output
      .split("\n")
      .find((line) => line.startsWith(prefix))
      ?.slice(prefix.length) ?? "";
  return {
    status: result.status ?? 1,
    output,
    user: pick("USER="),
    home: pick("HOME="),
    dir: pick("DIR="),
  };
}

describe("check_privileges", () => {
  it("skips sudo when running as root", () => {
    const result = runCheck({ euid: "0", sudoOnPath: false, tty: "missing" });
    expect(result.status, result.output).toBe(0);
    expect(result.sudo).toBe("");
    expect(result.output).toContain("Running as root");
    expect(result.output).not.toContain("sudo password required");
  });

  it("uses sudo without a TTY when sudo -n succeeds", () => {
    const result = runCheck({ euid: "1000", sudoNRc: 0, tty: "missing" });
    expect(result.status, result.output).toBe(0);
    expect(result.sudo).toBe("sudo");
    expect(result.output).toContain("sudo is available");
    expect(result.output).not.toContain("sudo password required");
  });

  it("exits when a password is required and no terminal exists", () => {
    const result = runCheck({ euid: "1000", sudoNRc: 1, tty: "missing" });
    expect(result.status).toBe(1);
    expect(result.output).toMatch(/terminal|root/i);
  });

  it("prompts on SUDO_TTY when sudo -n fails and -v succeeds", () => {
    const result = runCheck({
      euid: "1000",
      sudoNRc: 1,
      sudoVRc: 0,
      tty: "file",
    });
    expect(result.status, result.output).toBe(0);
    expect(result.sudo).toBe("sudo");
    expect(result.output).toContain("sudo password required");
    expect(result.output).toContain("sudo is available");
  });

  it("exits when sudo -v fails", () => {
    const result = runCheck({
      euid: "1000",
      sudoNRc: 1,
      sudoVRc: 1,
      tty: "file",
    });
    expect(result.status).toBe(1);
    expect(result.output).toContain("sudo authentication failed");
  });

  it("exits when sudo is missing for a non-root user", () => {
    const result = runCheck({ euid: "1000", sudoOnPath: false, tty: "file" });
    expect(result.status).toBe(1);
    expect(result.output).toContain("root privileges");
  });

  it("reads the sudo password from SUDO_TTY, not from a piped script", () => {
    const dir = tempDir();
    const binDir = path.join(dir, "bin");
    fs.mkdirSync(binDir, { recursive: true });

    const sudoTty = path.join(dir, "fake-tty");
    const stdinTarget = path.join(dir, "sudo-v-stdin-target");
    const stdinDump = path.join(dir, "sudo-v-stdin.dump");
    // Regular file, not a char device: `sudo -v <tty >tty` truncates it.
    // We only need the path so /proc/self/fd/0 can be distinguished from the pipe.
    fs.writeFileSync(sudoTty, "");
    fs.chmodSync(sudoTty, 0o666);

    writeExec(
      path.join(binDir, "sudo"),
      `#!/bin/bash
if [ "$1" = "-n" ] && [ "$2" = "true" ]; then
  exit 1
fi
if [ "$1" = "-v" ]; then
  readlink /proc/self/fd/0 > "${stdinTarget}"
  cat > "${stdinDump}"
  exit 0
fi
exit 1
`
    );

    const sentinel = "PIPE_SURVIVED_MONERO_SUITE_PRIVILEGES";
    const script = `GREEN=; NC=; RED=; YELLOW=
${CHECK_PRIVILEGES_FN}
check_privileges
printf '%s\\n' "${sentinel}"
printf 'SUDO=%s\\n' "$SUDO"
`;

    const result = spawnSync("/bin/bash", [], {
      encoding: "utf8",
      input: script,
      env: {
        ...process.env,
        PATH: `${binDir}${path.delimiter}${process.env.PATH ?? "/usr/bin:/bin"}`,
        LANG: "C",
        CHECK_EUID: "1000",
        SUDO_TTY: sudoTty,
      },
    });
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

    expect(result.status, output).toBe(0);
    expect(output).toContain("sudo password required");
    expect(output).toContain(sentinel);
    expect(output).toContain("SUDO=sudo");

    const target = fs.readFileSync(stdinTarget, "utf8").trim();
    expect(target).toBe(sudoTty);

    const dump = fs.readFileSync(stdinDump, "utf8");
    expect(dump).not.toContain(sentinel);
    expect(dump).not.toContain("check_privileges");
  });
});

describe("resolve_install_dir", () => {
  it("installs under the effective user home", () => {
    const result = runInstallDir({ idUn: "alice" });
    expect(result.status, result.output).toBe(0);
    expect(result.user).toBe("alice");
    expect(result.home).toBe("/home/alice");
    expect(result.dir).toBe("/home/alice/monero-suite");
  });

  it("uses root home when effective uid is root, ignoring SUDO_USER", () => {
    const result = runInstallDir({ idUn: "root", sudoUser: "alice" });
    expect(result.status, result.output).toBe(0);
    expect(result.user).toBe("root");
    expect(result.home).toBe("/root");
    expect(result.dir).toBe("/root/monero-suite");
    expect(result.dir).not.toContain("/home/alice");
  });
});
