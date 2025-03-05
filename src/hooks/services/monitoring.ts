import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode, torProxyModes } from "./types";

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
  ): Service => ({
    name: "Monitoring",
    description:
      "Monitoring with Prometheus and Grafana: see your node stats visualized in graphs. See on a map where your peers are located.",
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
      ZMQ_PORT: 18084,
      UNRESTRICTED_PORT: 18081,
      GF_USERS_ALLOW_SIGN_UP: false,
      GF_USERS_ALLOW_ORG_CREATE: false,
      GF_AUTH_ANONYMOUS_ENABLED: true,
      GF_AUTH_BASIC_ENABLED: false,
      GF_AUTH_DISABLE_LOGIN_FORM: true,
      GF_SECURITY_ADMIN_PASSWORD: "admin",
      GF_SECURITY_ADMIN_USER: "admin",
    },
    bash: `
# Download default Prometheus and Grafana configs/dashboards
# Execute line by line
mkdir -p monitoring/grafana/dashboards monitoring/grafana/provisioning/{dashboards,datasources} monitoring/prometheus 
wget -O monitoring/prometheus/config.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/prometheus/config.yaml
wget -O monitoring/grafana/grafana.ini https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/grafana.ini
wget -O monitoring/grafana/dashboards/node_stats.json https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/dashboards/node_stats.json
wget -O monitoring/grafana/provisioning/dashboards/all.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/provisioning/dashboards/all.yaml
wget -O monitoring/grafana/provisioning/datasources/all.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/provisioning/datasources/all.yaml
`,
    code: {
      prometheus: {
        image: "prom/prometheus:latest",
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
      },
      exporter: {
        image: "lalanza808/monerod_exporter:latest",
        container_name: "monerod_exporter",
        restart: "unless-stopped",
        command: "--monero-addr=http://monerod:18081",
      },
      nodemapper: {
        image: "lalanza808/nodemapper:latest",
        container_name: "nodemapper",
        restart: "unless-stopped",
        environment: {
          NODE_HOST: "monerod",
          NODE_PORT: "18081",
        },
      },
      grafana: {
        image: "grafana/grafana:latest",
        container_name: "grafana",
        user: "${UID:-1000}:${GID:-1000}",
        command: "-config=/etc/grafana/grafana.ini",
        restart: "unless-stopped",
        ports: [
          ...(networkMode === networkModes.local
            ? ["3000:3000"]
            : ["127.0.0.1:3000:3000"]),
        ],
        volumes: [
          "grafana:/var/lib/grafana",
          "./monitoring/grafana/grafana.ini:/etc/grafana/grafana.ini:ro",
          "./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro",
          "./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro",
        ],
        labels: isTraefik
          ? {
            "traefik.enable": "true",
            "traefik.http.routers.monitoring.rule": `Host(\`${grafanaDomain}\`)`,
            "traefik.http.routers.monitoring.entrypoints": "websecure",
            "traefik.http.routers.monitoring.tls.certresolver":
              certResolverName,
            "traefik.http.services.monitoring.loadbalancer.server.port":
              "3000",
          }
          : undefined,
        environment: {
          HOSTNAME: "grafana",
          GF_SERVER_ROOT_URL: isTraefik
            ? `https://${grafanaDomain}`
            : `http://${grafanaDomain}`,
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
        // Add network configuration if Tor proxy is enabled
        ...(torProxyMode !== torProxyModes.none
          ? {
            networks: {
              monero_suite_net: {
                aliases: ["grafana"]
              }
            },
            depends_on: {
              tor: {
                condition: "service_started",
              },
            }
          }
          : {}),
      },
    },
  });

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
