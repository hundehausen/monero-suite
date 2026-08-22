import { describe, expect, it } from "vitest";
import { createMoneroLwsService } from "./monero-lws";
import { generationCtx } from "./index";
import { DOCKER_IMAGES, MONEROD_PORTS, SERVICE_PORTS } from "@/lib/constants";
import { makeFullConfig } from "@/lib/make-full-config";

const run = (on: boolean, zmqPubBindPort: string = String(MONEROD_PORTS.zmqPub)) => {
  const config = makeFullConfig({
    services: { isMoneroLws: on, lwsDomain: "lws.example.com" },
    monerod: { zmqPubEnabled: true, zmqPubBindPort },
  });
  return createMoneroLwsService(config, generationCtx(config));
};

describe("createMoneroLwsService", () => {
  it("is unchecked when disabled", () => {
    expect(run(false).checked).toBe(false);
  });

  it("points --daemon at monerod ZMQ RPC and --sub at the live pub port", () => {
    const c = run(true, "18090").code["monero-lws"] as {
      image: string;
      command: string[];
      ports: string[];
    };
    expect(c.image).toBe(DOCKER_IMAGES.moneroLws);
    expect(c.command).toContain(`--daemon=tcp://monerod:${MONEROD_PORTS.zmqRpc}`);
    expect(c.command).toContain("--sub=tcp://monerod:18090");
    expect(c.command).toContain(`--rest-server=http://0.0.0.0:${SERVICE_PORTS.moneroLws}`);
    expect(c.command).toContain(`--admin-rest-server=http://0.0.0.0:${SERVICE_PORTS.moneroLwsAdmin}`);
    // 0.0.0.0 is an external bind; without this flag monero-lws exits on start.
    expect(c.command).toContain("--confirm-external-bind");
    expect(c.command).toContain("--max-subaddresses=50");
    expect(c.ports).toContain(`${SERVICE_PORTS.moneroLws}:${SERVICE_PORTS.moneroLws}`);
    expect(c.ports).toContain(`${SERVICE_PORTS.moneroLwsAdmin}:${SERVICE_PORTS.moneroLwsAdmin}`);
  });

  it("depends on monerod", () => {
    const c = run(true).code["monero-lws"] as { depends_on: Record<string, unknown> };
    expect(c.depends_on).toHaveProperty("monerod");
  });
});
