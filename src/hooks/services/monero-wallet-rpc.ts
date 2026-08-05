import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, NetworkMode, TorProxyMode, torProxyModes } from "./types";
import { createMoneroWalletRpcService } from "@/lib/service-generators/monero-wallet-rpc";

export const useMoneroWalletRpcService = () => {
  const [isMoneroWalletRpc, setIsMoneroWalletRpc] = useQueryState(
    "isMoneroWalletRpc",
    parseAsBoolean.withDefault(false)
  );

  const getMoneroWalletRpcService = (
    networkMode: NetworkMode,
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service =>
    createMoneroWalletRpcService(isMoneroWalletRpc, networkMode, torProxyMode);

  return {
    getMoneroWalletRpcService,
    stateFunctions: {
      isMoneroWalletRpc,
      setIsMoneroWalletRpc,
    },
  };
};
