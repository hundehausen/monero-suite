import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode } from "./types";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTraefikConfig, getPortBinding } from "@/lib/docker-helpers";

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
  ): Service => {
    const { domain, labels } = getTraefikConfig(isTraefik, "portainer", portainerDomain, "8000", certResolverName);
    return ({
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    checked: isPortainer,
    name: "Portainer",
    required: false,
    description:
      "A user-friendly web interface to manage your Docker containers. View logs, restart services, and monitor container health from your browser. Access at " + (isTraefik ? domain : "https://localhost:9443") + ".",
    volumes: {
      portainer_data: {},
    },
    code: {
      portainer: {
        image: DOCKER_IMAGES.portainer,
        restart: "unless-stopped",
        container_name: "portainer",
        ports: [getPortBinding(networkMode, 9443)],
        volumes: [
          "portainer_data:/data",
          "/var/run/docker.sock:/var/run/docker.sock",
        ],
        labels,
      },
    },
  });
  };

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
