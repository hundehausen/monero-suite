import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { useSecretState } from "@/hooks/use-secret-state";
import {
  DEFAULT_GRAFANA_ADMIN_PASSWORD,
  DEFAULT_GRAFANA_ADMIN_USER,
  GRAFANA_LOCAL_DOMAIN,
} from "@/lib/constants";

export const useMonitoringService = () => {
  const [isMonitoring, setIsMonitoring] = useQueryState(
    "isMonitoring",
    parseAsBoolean.withDefault(false)
  );
  const [grafanaDomain, setGrafanaDomain] = useQueryState(
    "grafanaDomain",
    parseAsString.withDefault(GRAFANA_LOCAL_DOMAIN)
  );
  const [grafanaAdminUser, setGrafanaAdminUser] = useSecretState(
    "grafanaAdminUser",
    DEFAULT_GRAFANA_ADMIN_USER
  );
  const [grafanaAdminPassword, setGrafanaAdminPassword] = useSecretState(
    "grafanaAdminPassword",
    DEFAULT_GRAFANA_ADMIN_PASSWORD
  );

  return {
    stateFunctions: {
      isMonitoring,
      setIsMonitoring,
      grafanaDomain,
      setGrafanaDomain,
      grafanaAdminUser,
      setGrafanaAdminUser,
      grafanaAdminPassword,
      setGrafanaAdminPassword,
    },
  };
};
