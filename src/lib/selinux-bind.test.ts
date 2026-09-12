import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SELINUX_BIND_MOUNTS_FN } from "./bash-templates";

const tempDirs: string[] = [];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "selinux-bind-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

const SAMPLE = `name: monero-suite
services:
  prometheus:
    volumes:
      - prometheus:/prometheus
      - ./monitoring/prometheus/config.yaml:/etc/prometheus/config.yaml:ro
  grafana:
    volumes:
      - grafana:/var/lib/grafana
      - ./monitoring/grafana/grafana.ini:/etc/grafana/grafana.ini:ro
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro
  cuprate:
    volumes:
      - cuprate-data:/home/cuprate/.local/share/cuprate
      - ./cuprate/Cuprated.toml:/home/cuprate/.config/cuprate/Cuprated.toml:ro
  monerod:
    volumes:
      - /mnt/data/monero:/home/monero/.bitmonero
    command:
      - --zmq-pub=tcp://0.0.0.0:18083
      - --rpc-bind-ip=0.0.0.0
  p2pool:
    volumes:
      - p2pool-data:/home/p2pool
      - /dev/null:/home/p2pool/.p2pool/p2pool.log:rw
      - /dev/hugepages:/dev/hugepages:rw
  portainer:
    volumes:
      - portainer_data:/data
      - /var/run/docker.sock:/var/run/docker.sock
  xmrig:
    volumes:
      - /lib/modules:/lib/modules
`;

function relabel(contents: string): { status: number; out: string; stderr: string } {
  const dir = tempDir();
  const compose = path.join(dir, "docker-compose.yml");
  fs.writeFileSync(compose, contents);
  const result = spawnSync(
    "bash",
    [
      "-c",
      `${SELINUX_BIND_MOUNTS_FN}
add_selinux_z_to_bind_mounts "$1"
cat "$1"
`,
      "selinux-bind",
      compose,
    ],
    { encoding: "utf8" }
  );
  return {
    status: result.status ?? 1,
    out: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("add_selinux_z_to_bind_mounts", () => {
  it("adds shared :z to project and custom host binds only", () => {
    const { status, out, stderr } = relabel(SAMPLE);
    expect(status, stderr).toBe(0);

    expect(out).toContain(
      "- ./monitoring/prometheus/config.yaml:/etc/prometheus/config.yaml:ro,z"
    );
    expect(out).toContain(
      "- ./monitoring/grafana/grafana.ini:/etc/grafana/grafana.ini:ro,z"
    );
    expect(out).toContain(
      "- ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro,z"
    );
    expect(out).toContain(
      "- ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro,z"
    );
    expect(out).toContain(
      "- ./cuprate/Cuprated.toml:/home/cuprate/.config/cuprate/Cuprated.toml:ro,z"
    );
    expect(out).toContain("- /mnt/data/monero:/home/monero/.bitmonero:z");

    expect(out).toContain("- prometheus:/prometheus\n");
    expect(out).toContain("- grafana:/var/lib/grafana\n");
    expect(out).toContain("- cuprate-data:/home/cuprate/.local/share/cuprate\n");
    expect(out).toContain("- p2pool-data:/home/p2pool\n");
    expect(out).toContain("- portainer_data:/data\n");

    expect(out).toContain("- /dev/null:/home/p2pool/.p2pool/p2pool.log:rw\n");
    expect(out).toContain("- /dev/hugepages:/dev/hugepages:rw\n");
    expect(out).toContain("- /var/run/docker.sock:/var/run/docker.sock\n");
    expect(out).toContain("- /lib/modules:/lib/modules\n");

    expect(out).toContain("- --zmq-pub=tcp://0.0.0.0:18083\n");
    expect(out).toContain("- --rpc-bind-ip=0.0.0.0\n");
  });

  it("is idempotent when :z is already present", () => {
    const once = relabel(SAMPLE);
    expect(once.status).toBe(0);
    const twice = relabel(once.out);
    expect(twice.status).toBe(0);
    expect(twice.out).toBe(once.out);
  });
});
