import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, NetworkMode, TorProxyMode, torProxyModes } from "./types";
import { GRAFANA_LOCAL_DOMAIN } from "@/lib/constants";
import { createMonitoringService } from "@/lib/service-generators/monitoring";

export const useMonitoringService = () => {
  const [isMonitoring, setIsMonitoring] = useQueryState(
    "isMonitoring",
    parseAsBoolean.withDefault(false)
  );
  const [grafanaDomain, setGrafanaDomain] = useQueryState(
    "grafanaDomain",
    parseAsString.withDefault(GRAFANA_LOCAL_DOMAIN)
  );

  const getMonitoringService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    zmqPubPort: number,
    certResolverName: string = "monerosuite",
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service =>
    createMonitoringService(isMonitoring, grafanaDomain, networkMode, isTraefik, certResolverName, torProxyMode, zmqPubPort);

  return {
    getMonitoringService,
    stateFunctions: {
      isMonitoring,
      setIsMonitoring,
      grafanaDomain,
      setGrafanaDomain,
    },
  };
};
