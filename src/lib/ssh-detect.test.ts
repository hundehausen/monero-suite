import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DETECT_SSH_PORTS_FN } from "./bash-templates";

const tempDirs: string[] = [];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ssh-detect-"));
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

type DetectOpts = {
  sshConnection?: string;
  procEnviron?: string;
  ssOutput?: string;
  sshdT?: string;
  systemctlCat?: string;
  config?: string;
  configD?: Record<string, string>;
};

function detect(opts: DetectOpts = {}): {
  status: number;
  ports: string[];
  sources: string;
  output: string;
} {
  const dir = tempDir();
  const binDir = path.join(dir, "bin");
  const sshDir = path.join(dir, "ssh");
  const configD = path.join(sshDir, "sshd_config.d");
  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(configD, { recursive: true });

  const configPath = path.join(sshDir, "sshd_config");
  if (opts.config !== undefined) {
    fs.writeFileSync(configPath, opts.config);
  }

  if (opts.configD) {
    for (const [name, body] of Object.entries(opts.configD)) {
      fs.writeFileSync(path.join(configD, name), body);
    }
  }

  const ssOut = path.join(binDir, "ss-out.txt");
  fs.writeFileSync(ssOut, opts.ssOutput ?? "");
  writeExec(
    path.join(binDir, "ss"),
    opts.ssOutput !== undefined
      ? `#!/bin/bash\ncat "${ssOut}"\n`
      : `#!/bin/bash\nexit 1\n`
  );

  const sshdOut = path.join(binDir, "sshd-t.txt");
  fs.writeFileSync(sshdOut, opts.sshdT ?? "");
  writeExec(
    path.join(binDir, "sshd"),
    opts.sshdT !== undefined
      ? `#!/bin/bash\n[ "$1" = "-T" ] || exit 1\ncat "${sshdOut}"\n`
      : `#!/bin/bash\nexit 1\n`
  );

  const systemctlOut = path.join(binDir, "systemctl-cat.txt");
  fs.writeFileSync(systemctlOut, opts.systemctlCat ?? "");
  writeExec(
    path.join(binDir, "systemctl"),
    opts.systemctlCat !== undefined
      ? `#!/bin/bash\n[ "$1" = "cat" ] || exit 1\ncat "${systemctlOut}"\n`
      : `#!/bin/bash\nexit 1\n`
  );

  let procEnvPath = "";
  if (opts.procEnviron !== undefined) {
    procEnvPath = path.join(dir, "parent.env");
    fs.writeFileSync(procEnvPath, opts.procEnviron);
  }

  const result = spawnSync(
    "bash",
    [
      "-c",
      `
SUDO=""
SSH_PORTS=()
SSH_SOURCES=""
SSHD_CONFIG="${configPath}"
SSHD_CONFIG_D="${configD}"
${procEnvPath ? `SSH_PROC_ENVIRON="${procEnvPath}"` : "SSH_PROC_ENVIRON=/dev/null"}
${DETECT_SSH_PORTS_FN}
detect_ssh_ports
printf 'PORTS=%s\\n' "\${SSH_PORTS[*]}"
printf 'SOURCES=%s\\n' "$SSH_SOURCES"
`,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${binDir}${path.delimiter}${process.env.PATH ?? "/usr/bin:/bin"}`,
        LANG: "C",
        SSH_CONNECTION: opts.sshConnection ?? "",
      },
    }
  );

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const portsLine = output.split("\n").find((line) => line.startsWith("PORTS="));
  const sourcesLine = output
    .split("\n")
    .find((line) => line.startsWith("SOURCES="));
  const ports =
    portsLine === undefined || portsLine === "PORTS="
      ? []
      : portsLine.slice("PORTS=".length).trim().split(/\s+/).filter(Boolean);

  return {
    status: result.status ?? 1,
    ports,
    sources: sourcesLine?.slice("SOURCES=".length).trim() ?? "",
    output,
  };
}

describe("detect_ssh_ports", () => {
  it("reads the server port from SSH_CONNECTION", () => {
    const result = detect({
      sshConnection: "1.2.3.4 12345 5.6.7.8 2222",
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports).toEqual(["2222"]);
    expect(result.sources).toBe("session");
  });

  it("unions session and sshd -T ports", () => {
    const result = detect({
      sshConnection: "1.2.3.4 12345 5.6.7.8 2222",
      sshdT: "port 22\nport 2222\nuseprivilege 1\n",
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports.sort()).toEqual(["22", "2222"]);
    expect(result.sources).toContain("session");
    expect(result.sources).toContain("sshd_t");
  });

  it("reads every uncommented Port from config and skips comments", () => {
    const result = detect({
      config: "Port 22\nPort 2222\n#Port 99\n# Port 100\n",
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports.sort()).toEqual(["22", "2222"]);
    expect(result.sources).toBe("config");
  });

  it("does not invent port 22 when nothing is found", () => {
    const result = detect({});
    expect(result.status, result.output).toBe(0);
    expect(result.ports).toEqual([]);
    expect(result.sources).toBe("none");
  });

  it("ignores invalid Port tokens", () => {
    const result = detect({
      config: "Port abc\nPort 0\nPort 70000\nPort 22\n",
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports).toEqual(["22"]);
  });

  it("parses systemd ListenStream values", () => {
    const result = detect({
      systemctlCat: [
        "# /lib/systemd/system/ssh.socket",
        "[Socket]",
        "ListenStream=2222",
        "ListenStream=0.0.0.0:2222",
        "ListenStream=[::]:2222",
        "ListenStream=/run/sshd.socket",
        "",
      ].join("\n"),
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports).toEqual(["2222"]);
    expect(result.sources).toBe("systemd");
  });

  it("does not take Port lines after Match in a raw config file", () => {
    const result = detect({
      config: "Port 22\nMatch User foo\n    Port 99\n",
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports).toEqual(["22"]);
    expect(result.ports).not.toContain("99");
  });

  it("reads SSH_CONNECTION from a parent environ file when the env var is empty", () => {
    const result = detect({
      procEnviron: "HOME=/root\0SSH_CONNECTION=10.0.0.1 1 10.0.0.2 2200\0TERM=xterm\0",
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports).toEqual(["2200"]);
    expect(result.sources).toBe("session");
  });

  it("parses ss listening lines for sshd and dropbear", () => {
    const result = detect({
      ssOutput: [
        "State Recv-Q Send-Q Local Address:Port Peer Address:Port Process",
        'LISTEN 0 128 0.0.0.0:22 0.0.0.0:* users:(("sshd",pid=1,fd=3))',
        'LISTEN 0 128 0.0.0.0:2222 0.0.0.0:* users:(("dropbear",pid=2,fd=3))',
        'LISTEN 0 128 0.0.0.0:80 0.0.0.0:* users:(("nginx",pid=3,fd=3))',
      ].join("\n"),
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports.sort()).toEqual(["22", "2222"]);
    expect(result.sources).toBe("listening");
  });

  it("reads drop-in config files in sshd_config.d", () => {
    const result = detect({
      config: "PasswordAuthentication yes\n",
      configD: { "50-cloud.conf": "Port 2222\n" },
    });
    expect(result.status, result.output).toBe(0);
    expect(result.ports).toEqual(["2222"]);
    expect(result.sources).toBe("config");
  });
});
