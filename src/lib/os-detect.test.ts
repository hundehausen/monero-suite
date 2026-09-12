import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { RESOLVE_PKG_MANAGER_FN } from "./bash-templates";
import { generateInstallationScript } from "./script-generator";

function resolve(
  id: string,
  idLike: string,
  bins: { dnf?: boolean; yum?: boolean } = {}
): { status: number; manager: string; output: string } {
  const result = spawnSync(
    "bash",
    [
      "-c",
      `
${RESOLVE_PKG_MANAGER_FN}
command() {
  if [ "$1" = "-v" ]; then
    case "$2" in
      dnf) [ "\${FAKE_DNF:-}" = 1 ] && echo /usr/bin/dnf && return 0; return 1 ;;
      yum) [ "\${FAKE_YUM:-}" = 1 ] && echo /usr/bin/yum && return 0; return 1 ;;
    esac
  fi
  builtin command "$@"
}
RED=; NC=
resolve_pkg_manager "$TEST_ID" "$TEST_LIKE"
echo "$PKG_MANAGER"
`,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        TEST_ID: id,
        TEST_LIKE: idLike,
        FAKE_DNF: bins.dnf ? "1" : "0",
        FAKE_YUM: bins.yum ? "1" : "0",
      },
    }
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const lines = (result.stdout ?? "").trim().split("\n");
  return {
    status: result.status ?? 1,
    manager: lines[lines.length - 1] ?? "",
    output,
  };
}

describe("resolve_pkg_manager", () => {
  it("maps Debian/Ubuntu and common derivatives to apt", () => {
    for (const id of [
      "ubuntu",
      "debian",
      "linuxmint",
      "pop",
      "elementary",
      "zorin",
      "raspbian",
      "kali",
    ]) {
      expect(resolve(id, "").status, id).toBe(0);
      expect(resolve(id, "").manager, id).toBe("apt");
    }
  });

  it("maps unknown IDs with debian/ubuntu ID_LIKE to apt", () => {
    expect(resolve("neon", "ubuntu debian").manager).toBe("apt");
    expect(resolve("mabox", "debian").manager).toBe("apt");
  });

  it("maps fedora to dnf without probing PATH", () => {
    expect(resolve("fedora", "", { dnf: false, yum: false }).manager).toBe("dnf");
  });

  it("picks dnf over yum on RHEL-family hosts when both exist", () => {
    expect(resolve("rocky", "", { dnf: true, yum: true }).manager).toBe("dnf");
    expect(resolve("centos", "rhel fedora", { dnf: true, yum: true }).manager).toBe(
      "dnf"
    );
  });

  it("falls back to yum when dnf is missing", () => {
    expect(resolve("centos", "", { dnf: false, yum: true }).manager).toBe("yum");
    expect(resolve("nobara", "fedora", { dnf: false, yum: true }).manager).toBe(
      "yum"
    );
  });

  it("rejects distros that are neither Debian-family nor RPM-family", () => {
    const arch = resolve("arch", "");
    expect(arch.status).not.toBe(0);
    expect(arch.output).toMatch(/Unsupported OS 'arch'/);

    const suse = resolve("opensuse-leap", "suse opensuse");
    expect(suse.status).not.toBe(0);
  });
});

describe("generated install script OS detection", () => {
  it("sources ID_LIKE and includes yum helpers", () => {
    const script = generateInstallationScript("services: {}\n", "");
    expect(script).toContain("resolve_pkg_manager");
    expect(script).toContain("${ID_LIKE:-}");
    expect(script).toContain("linuxmint|pop|elementary|zorin|raspbian|kali");
    expect(script).toContain("$SUDO yum makecache ;;");
    expect(script).toContain("$SUDO yum install -y");
    expect(script).toContain("$SUDO yum update -y");
  });
});
