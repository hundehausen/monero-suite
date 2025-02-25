import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode } from "./types";

export const usePortainerService = () => {
  const [isPortainer, setIsPortainer] = useQueryState(
    "isPortainer",
    parseAsBoolean.withDefault(false)
  );
  const [portainerDomain, setPortainerDomain] = useQueryState(
    "portainerDomain",
    parseAsString.withDefault("portainer.monerosuite.org")
  );

  const getPortainerService = (
    networkMode: NetworkMode,
    isTraefik: boolean
  ): Service => ({
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    checked: isPortainer,
    name: "Portainer",
    required: false,
    description:
      "Manage your Monero Suite Docker services in the browser with Portainer. You can view logs, start, stop and restart containers easly. Visit http://localhost:8000 or https://localhost:9443 if Portainer is running.",
    volumes: {
      portainer_data: {},
    },
    code: {
      portainer: {
        image: "portainer/portainer-ce:latest",
        restart: "unless-stopped",
        container_name: "portainer",
        ports: [
          ...(networkMode === networkModes.local
            ? ["8000:8000", "9443:9443"]
            : ["127.0.0.1:8000:8000", "127.0.0.1:9443:9443"]),
        ],
        volumes: [
          "portainer_data:/data",
          "/var/run/docker.sock:/var/run/docker.sock",
        ],
        labels: isTraefik
          ? {
              "traefik.enable": "true",
              "traefik.http.routers.monitoring.rule": `Host(\`${portainerDomain}\`)`,
              "traefik.http.routers.monitoring.entrypoints": "websecure",
              "traefik.http.routers.monitoring.tls.certresolver": "monerosuite",
              "traefik.http.services.monitoring.loadbalancer.server.port":
                "8000",
            }
          : undefined,
      },
    },
  });

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
