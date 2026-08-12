import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, NetworkMode, TorProxyMode, torProxyModes } from "./types";
import { createMoneroPayService } from "@/lib/service-generators/moneropay";
import { MONEROPAY_TRAEFIK_DEFAULT_DOMAIN } from "@/lib/constants";

export const useMoneroPayService = () => {
  const [isMoneroPay, setIsMoneroPay] = useQueryState(
    "isMoneroPay",
    parseAsBoolean.withDefault(false)
  );
  const [moneroPayDomain, setMoneroPayDomain] = useQueryState(
    "moneroPayDomain",
    parseAsString.withDefault(MONEROPAY_TRAEFIK_DEFAULT_DOMAIN)
  );

  const getMoneroPayService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string,
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service =>
    createMoneroPayService(
      { isMoneroPay, moneroPayDomain },
      networkMode,
      isTraefik,
      certResolverName,
      torProxyMode
    );

  return {
    getMoneroPayService,
    stateFunctions: {
      isMoneroPay,
      setIsMoneroPay,
      moneroPayDomain,
      setMoneroPayDomain,
    },
  };
};
