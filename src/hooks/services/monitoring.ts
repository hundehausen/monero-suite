import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, NetworkMode, torProxyModes } from "./types";
import { SERVICE_PORTS } from "@/lib/constants";
import { createMonitoringService } from "@/lib/service-generators/monitoring";

export const useMonitoringService = () => {
  const [isMonitoring, setIsMonitoring] = useQueryState(
    "isMonitoring",
    parseAsBoolean.withDefault(false)
  );
  const [grafanaDomain, setGrafanaDomain] = useQueryState(
    "grafanaDomain",
    parseAsString.withDefault(`localhost:${SERVICE_PORTS.grafana}`)
  );

  const getMonitoringService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: string = torProxyModes.none
  ): Service =>
    createMonitoringService(isMonitoring, grafanaDomain, networkMode, isTraefik, certResolverName, torProxyMode);

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
