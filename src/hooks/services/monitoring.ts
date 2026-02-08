import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode, torProxyModes } from "./types";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTraefikConfig, getPortBinding } from "@/lib/docker-helpers";
import { MONITORING_BASH_COMMANDS } from "@/lib/script-generator";

export const useMonitoringService = () => {
  const [isMonitoring, setIsMonitoring] = useQueryState(
    "isMonitoring",
    parseAsBoolean.withDefault(false)
  );
  const [grafanaDomain, setGrafanaDomain] = useQueryState(
    "grafanaDomain",
    parseAsString.withDefault("localhost:3000")
  );

  const getMonitoringService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: string = torProxyModes.none
  ): Service => {
    const { domain, labels } = getTraefikConfig(isTraefik, "monitoring", grafanaDomain, "3000", certResolverName, "localhost:3000");
    return ({
    name: "Monitoring",
    description:
      "Visualize your node's performance with Grafana dashboards. View blockchain stats, network peers on a world map, and system metrics in real-time.",
    checked: isMonitoring,
    required: false,
    architecture: [architectures.linuxAmd],
    volumes: {
      grafana: {},
      prometheus: {},
    },
    env: {
      P2P_PORT: 18080,
      RESTRICTED_PORT: 18089,
      ZMQ_PORT: 18083,
      UNRESTRICTED_PORT: 18081,
      GF_USERS_ALLOW_SIGN_UP: false,
      GF_USERS_ALLOW_ORG_CREATE: false,
      GF_AUTH_ANONYMOUS_ENABLED: true,
      GF_AUTH_BASIC_ENABLED: false,
      GF_AUTH_DISABLE_LOGIN_FORM: true,
      GF_SECURITY_ADMIN_PASSWORD: "admin",
      GF_SECURITY_ADMIN_USER: "admin",
    },
    bash: MONITORING_BASH_COMMANDS,
    code: {
      prometheus: {
        image: DOCKER_IMAGES.prometheus,
        container_name: "prometheus",
        restart: "unless-stopped",
        command: [
          "--config.file=/etc/prometheus/config.yaml",
          "--storage.tsdb.path=/prometheus",
          "--storage.tsdb.retention.time=${PROM_RETENTION:-360d}",
        ],
        volumes: [
          "prometheus:/prometheus",
          "./monitoring/prometheus/config.yaml:/etc/prometheus/config.yaml:ro",
        ],
        depends_on: {
          exporter: {
            condition: "service_started"
          }
        }
      },
      exporter: {
        image: DOCKER_IMAGES.monerodExporter,
        container_name: "monerod_exporter",
        restart: "unless-stopped",
        command: "--monero-addr=http://monerod:18081",
        depends_on: {
          monerod: {
            condition: "service_healthy"
          }
        }
      },
      nodemapper: {
        image: DOCKER_IMAGES.nodemapper,
        container_name: "nodemapper",
        restart: "unless-stopped",
        environment: {
          NODE_HOST: "monerod",
          NODE_PORT: "18081",
        }, 
        depends_on: {
          monerod: {
            condition: "service_healthy"
          }
        }
      },
      grafana: {
        image: DOCKER_IMAGES.grafana,
        container_name: "grafana",
        user: "${UID:-1000}:${GID:-1000}",
        command: "-config=/etc/grafana/grafana.ini",
        restart: "unless-stopped",
        ports: [getPortBinding(networkMode, 3000)],
        volumes: [
          "grafana:/var/lib/grafana",
          "./monitoring/grafana/grafana.ini:/etc/grafana/grafana.ini:ro",
          "./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro",
          "./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro",
        ],
        labels,
        environment: {
          HOSTNAME: "grafana",
          GF_SERVER_ROOT_URL: isTraefik
            ? `https://${domain}`
            : `http://${domain}`,
          GF_ANALYTICS_REPORTING_ENABLED: "false",
          GF_ANALYTICS_CHECK_FOR_UPDATES: "false",
          GF_LOG_LEVEL: "${GF_LOG_LEVEL:-error}",
          GF_USERS_ALLOW_SIGN_UP: "${GF_USERS_ALLOW_SIGN_UP:-false}",
          GF_USERS_ALLOW_ORG_CREATE: "${GF_USERS_ALLOW_ORG_CREATE:-false}",
          GF_AUTH_ANONYMOUS_ENABLED: "${GF_AUTH_ANONYMOUS_ENABLED:-true}",
          GF_AUTH_BASIC_ENABLED: "${GF_AUTH_BASIC_ENABLED:-false}",
          GF_AUTH_DISABLE_LOGIN_FORM: "${GF_AUTH_DISABLE_LOGIN_FORM:-true}",
          GF_SECURITY_ADMIN_PASSWORD: "${GF_SECURITY_ADMIN_PASSWORD:-admin}",
          GF_SECURITY_ADMIN_USER: "${GF_SECURITY_ADMIN_USER:-admin}",
        },
        depends_on: {
          monerod: {
            condition: "service_started",
          },
        },
        // Add network configuration if Tor proxy is enabled
        ...(torProxyMode !== torProxyModes.none
          ? {
            networks: {
              monero_suite_net: {
                aliases: ["grafana"]
              }
            }
          }
          : {}),
      },
    },
  });
  };

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
