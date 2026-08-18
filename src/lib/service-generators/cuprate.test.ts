import { describe, expect, it } from "vitest";
import { createCuprateService } from "./cuprate";
import { createMoneroWalletRpcService } from "./monero-wallet-rpc";
import { networkModes } from "@/lib/service-types";

describe("createCuprateService", () => {
  it.each([networkModes.local, networkModes.exposed])(
    "does not bind the same host port as monero-wallet-rpc (%s mode)",
    (networkMode) => {
      const cuprate = createCuprateService(true, networkMode).code["cuprate"];
      const walletRpc = createMoneroWalletRpcService(true, networkMode).code["monero-wallet-rpc"];

      const portBinding = (s: { ports?: Array<string | number | { [k: string]: unknown }> }) =>
        s.ports?.map((p) => (typeof p === "object" ? "" : p.toString())).find((p) => p !== "");
      const hostPortOf = (binding?: string) => binding?.split(":").filter(Boolean).at(-2);

      const cuprateHost = hostPortOf(portBinding(cuprate));
      const walletRpcHost = hostPortOf(portBinding(walletRpc));

      expect(cuprateHost).toBeDefined();
      expect(walletRpcHost).toBeDefined();
      expect(cuprateHost).not.toBe(walletRpcHost);
    }
  );
});
