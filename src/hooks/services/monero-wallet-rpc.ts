import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, NetworkMode } from "./types";
import { createMoneroWalletRpcService } from "@/lib/service-generators/monero-wallet-rpc";

export const useMoneroWalletRpcService = () => {
  const [isMoneroWalletRpc, setIsMoneroWalletRpc] = useQueryState(
    "isMoneroWalletRpc",
    parseAsBoolean.withDefault(false)
  );

  const getMoneroWalletRpcService = (networkMode: NetworkMode): Service =>
    createMoneroWalletRpcService(isMoneroWalletRpc, networkMode);

  return {
    getMoneroWalletRpcService,
    stateFunctions: {
      isMoneroWalletRpc,
      setIsMoneroWalletRpc,
    },
  };
};
