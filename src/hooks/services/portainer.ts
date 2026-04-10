import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, NetworkMode } from "./types";
import { createPortainerService } from "@/lib/service-generators/portainer";

export const usePortainerService = () => {
  const [isPortainer, setIsPortainer] = useQueryState(
    "isPortainer",
    parseAsBoolean.withDefault(false)
  );
  const [portainerDomain, setPortainerDomain] = useQueryState(
    "portainerDomain",
    parseAsString.withDefault("portainer.example.com")
  );

  const getPortainerService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite"
  ): Service =>
    createPortainerService(isPortainer, portainerDomain, networkMode, isTraefik, certResolverName);

  return {
    getPortainerService,
    stateFunctions: {
      isPortainer,
      setIsPortainer,
      portainerDomain,
      setPortainerDomain,
    },
  };
};
