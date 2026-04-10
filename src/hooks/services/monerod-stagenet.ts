import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, NetworkMode, torProxyModes, TorProxyMode } from "./types";
import { createMonerodStagenetService } from "@/lib/service-generators/monerod-stagenet";

export const useMonerodStagenetService = () => {
  const [isStagenetNode, setIsStagenetNode] = useQueryState(
    "isStagenetNode",
    parseAsBoolean.withDefault(false)
  );
  const [isStagenetNodePublic, setIsStagenetNodePublic] = useQueryState(
    "isStagenetNodePublic",
    parseAsBoolean.withDefault(true)
  );
  const [isMoneroStagenetCustomLocation, setIsMoneroStagenetCustomLocation] = useQueryState(
    "isMoneroStagenetCustomLocation",
    parseAsBoolean.withDefault(false)
  );
  const [
    moneroStagenetBlockchainLocation,
    setMoneroStagenetBlockchainLocation,
  ] = useQueryState(
    "moneroStagenetBlockchainLocation",
    parseAsString.withDefault("~/.bitmonero")
  );
  const [stagenetNodeDomain, setStagenetNodeDomain] = useQueryState(
    "stagenetNodeDomain",
    parseAsString.withDefault("stagenet.example.com")
  );
  const [moneroNodeNoLogs] = useQueryState(
    "moneroNodeNoLogs",
    parseAsBoolean.withDefault(false)
  );

  const getMonerodStagenetService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service =>
    createMonerodStagenetService(
      { isStagenetNode, isStagenetNodePublic, isMoneroStagenetCustomLocation, moneroStagenetBlockchainLocation, stagenetNodeDomain },
      moneroNodeNoLogs,
      networkMode,
      isTraefik,
      certResolverName,
      torProxyMode
    );

  return {
    getMonerodStagenetService,
    stateFunctions: {
      isStagenetNode,
      setIsStagenetNode,
      isStagenetNodePublic,
      setIsStagenetNodePublic,
      isMoneroStagenetCustomLocation,
      setIsMoneroStagenetCustomLocation,
      moneroStagenetBlockchainLocation,
      setMoneroStagenetBlockchainLocation,
      stagenetNodeDomain,
      setStagenetNodeDomain,
    },
  };
};
