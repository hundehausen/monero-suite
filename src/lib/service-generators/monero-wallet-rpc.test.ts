import { describe, expect, it } from "vitest";
import { createMoneroWalletRpcService } from "./monero-wallet-rpc";
import { networkModes, torProxyModes } from "@/lib/service-types";
import { generateEnvFile } from "@/app/utils";

const svc = createMoneroWalletRpcService(
  true,
  networkModes.local,
  torProxyModes.none
);

describe("createMoneroWalletRpcService", () => {
  it("exposes RPC login in service.env so .env preview and compose share one source", () => {
    expect(svc.env).toEqual({
      WALLET_RPC_USER: "monero",
      WALLET_RPC_PASSWORD: "changeme",
    });

    const c = svc.code["monero-wallet-rpc"] as { command: string[] };
    expect(c.command).toContain(
      "--rpc-login=${WALLET_RPC_USER}:${WALLET_RPC_PASSWORD}"
    );
    expect(c.command).not.toContain("--disable-rpc-login");
    expect(c.command.some((arg) => arg.includes(":-"))).toBe(false);

    const envFile = generateEnvFile([svc]);
    expect(envFile).toContain("WALLET_RPC_USER=monero");
    expect(envFile).toContain("WALLET_RPC_PASSWORD=changeme");
  });

  it("persists wallets on the image home volume without a chown sidecar", () => {
    const c = svc.code["monero-wallet-rpc"] as {
      command: string[];
      volumes: string[];
      depends_on?: Record<string, unknown>;
    };

    expect(c.command).toContain("--wallet-dir=/home/monero/wallet");
    expect(c.volumes).toContain("monero-wallet-rpc-data:/home/monero");
    expect(svc.code["wallet-rpc-vol-chown"]).toBeUndefined();
    expect(c.depends_on).toBeUndefined();
  });
});
