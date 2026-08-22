import { describe, expect, it } from "vitest";
import { createMoneroPayService } from "./moneropay";
import { DOCKER_IMAGES, SERVICE_PORTS } from "@/lib/constants";
import { makeFullConfig } from "@/lib/make-full-config";

const pay = createMoneroPayService(
  makeFullConfig({
    services: { isMoneroPay: true, moneroPayDomain: "pay.example.com" },
  })
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
    expect(c.environment.RPC_USERNAME).toBe("${WALLET_RPC_USER}");
    expect(c.environment.RPC_PASSWORD).toBe("${WALLET_RPC_PASSWORD}");
    expect(c.environment.SQLITE).toBe("file:/app/sqlite/db.sqlite");
    expect(c.environment.BIND).toBe(`0.0.0.0:${SERVICE_PORTS.moneroPay}`);
    expect(c.environment.ZERO_CONF).toBe("true");
    expect(c.environment.POSTGRESQL).toBeUndefined();
    expect(c.volumes).toContain("moneropay-data:/app/sqlite");
    expect(c.depends_on).toHaveProperty("monero-wallet-rpc");
    expect(c.depends_on["monero-wallet-rpc"]).toEqual({
      condition: "service_healthy",
    });
    expect(c.ports).toContain(`${SERVICE_PORTS.moneroPay}:${SERVICE_PORTS.moneroPay}`);
  });
});
