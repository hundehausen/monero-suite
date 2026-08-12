import { describe, expect, it } from "vitest";
import { createMoneroPayService } from "./moneropay";
import { networkModes, torProxyModes } from "@/hooks/services/types";
import { DOCKER_IMAGES, SERVICE_PORTS } from "@/lib/constants";

const pay = createMoneroPayService(
  { isMoneroPay: true, moneroPayDomain: "pay.example.com" },
  networkModes.local,
  false,
  "monerosuite",
  torProxyModes.none
);

describe("createMoneroPayService", () => {
  it("talks to suite wallet-rpc and stores SQLite on a volume", () => {
    const c = pay.code.moneropay as {
      image: string;
      environment: Record<string, string>;
      volumes: string[];
      ports: string[];
      depends_on: Record<string, unknown>;
    };
    expect(c.image).toBe(DOCKER_IMAGES.moneroPay);
    expect(c.environment.RPC_ADDRESS).toBe(
      `http://monero-wallet-rpc:${SERVICE_PORTS.moneroWalletRpc}/json_rpc`
    );
    expect(c.environment.SQLITE).toBe("file:/app/sqlite/db.sqlite");
    expect(c.environment.BIND).toBe(`0.0.0.0:${SERVICE_PORTS.moneroPay}`);
    expect(c.environment.ZERO_CONF).toBe("true");
    expect(c.environment.POSTGRESQL).toBeUndefined();
    expect(c.volumes).toContain("moneropay-data:/app/sqlite");
    expect(c.depends_on).toHaveProperty("monero-wallet-rpc");
    expect(c.ports).toContain(`${SERVICE_PORTS.moneroPay}:${SERVICE_PORTS.moneroPay}`);
  });
});
