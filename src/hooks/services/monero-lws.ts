import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, NetworkMode, TorProxyMode, torProxyModes } from "./types";
import { createMoneroLwsService } from "@/lib/service-generators/monero-lws";
import { LWS_TRAEFIK_DEFAULT_DOMAIN } from "@/lib/constants";

export const useMoneroLwsService = () => {
  const [isMoneroLws, setIsMoneroLws] = useQueryState(
    "isMoneroLws",
    parseAsBoolean.withDefault(false)
  );
  const [lwsDomain, setLwsDomain] = useQueryState(
    "lwsDomain",
    parseAsString.withDefault(LWS_TRAEFIK_DEFAULT_DOMAIN)
  );

  const getMoneroLwsService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string,
    torProxyMode: TorProxyMode = torProxyModes.none,
    zmqPubPort: number
  ): Service =>
    createMoneroLwsService(
      { isMoneroLws, lwsDomain },
      networkMode,
      isTraefik,
      certResolverName,
      torProxyMode,
      zmqPubPort
    );

  return {
    getMoneroLwsService,
    stateFunctions: { isMoneroLws, setIsMoneroLws, lwsDomain, setLwsDomain },
  };
};
