import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, NetworkMode, torProxyModes, TorProxyMode } from "./types";
import { createOnionMoneroBlockchainExplorerService } from "@/lib/service-generators/onion-monero-blockchain-explorer";

export const useOnionMoneroBlockchainExplorerService = () => {
  const [isOnionMoneroBlockchainExplorer, setIsOnionMoneroBlockchainExplorer] =
    useQueryState(
      "isOnionMoneroBlockchainExplorer",
      parseAsBoolean.withDefault(false)
    );
  const [
    onionMoneroBlockchainExplorerDomain,
    setOnionMoneroBlockchainExplorerDomain,
  ] = useQueryState(
    "onionMoneroBlockchainExplorerDomain",
    parseAsString.withDefault("onion-explorer.example.com")
  );

  const getOnionMoneroBlockchainExplorerService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service =>
    createOnionMoneroBlockchainExplorerService(isOnionMoneroBlockchainExplorer, onionMoneroBlockchainExplorerDomain, networkMode, isTraefik, certResolverName, torProxyMode);

  return {
    getOnionMoneroBlockchainExplorerService,
    stateFunctions: {
      isOnionMoneroBlockchainExplorer,
      setIsOnionMoneroBlockchainExplorer,
      onionMoneroBlockchainExplorerDomain,
      setOnionMoneroBlockchainExplorerDomain,
    },
  };
};
