import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, NetworkMode, torProxyModes, TorProxyMode } from "./types";
import { createMoneroblockService } from "@/lib/service-generators/moneroblock";

export const useMoneroblockService = () => {
  const [isMoneroblock, setIsMoneroblock] = useQueryState(
    "isMoneroblock",
    parseAsBoolean.withDefault(false)
  );
  const [isMoneroblockLoggingDisabled, setIsMoneroblockLoggingDisabled] = useQueryState(
    "isMoneroblockLoggingDisabled",
    parseAsBoolean.withDefault(false)
  );
  const [moneroBlockDomain, setMoneroBlockDomain] = useQueryState(
    "moneroBlockDomain",
    parseAsString.withDefault("explorer.example.com")
  );

  const getMoneroblockService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service =>
    createMoneroblockService(isMoneroblock, isMoneroblockLoggingDisabled, moneroBlockDomain, networkMode, isTraefik, certResolverName, torProxyMode);

  return {
    getMoneroblockService,
    stateFunctions: {
      isMoneroblock,
      setIsMoneroblock,
      isMoneroblockLoggingDisabled,
      setIsMoneroblockLoggingDisabled,
      moneroBlockDomain,
      setMoneroBlockDomain,
    },
  };
};
