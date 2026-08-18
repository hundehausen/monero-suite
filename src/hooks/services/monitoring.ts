import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { GRAFANA_LOCAL_DOMAIN } from "@/lib/constants";

export const useMonitoringService = () => {
  const [isMonitoring, setIsMonitoring] = useQueryState(
    "isMonitoring",
    parseAsBoolean.withDefault(false)
  );
  const [grafanaDomain, setGrafanaDomain] = useQueryState(
    "grafanaDomain",
    parseAsString.withDefault(GRAFANA_LOCAL_DOMAIN)
  );

  return {
    stateFunctions: {
      isMonitoring,
      setIsMonitoring,
      grafanaDomain,
      setGrafanaDomain,
    },
  };
};
