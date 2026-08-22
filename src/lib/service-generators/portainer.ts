import { Service, architectures } from "@/lib/service-types";
import { DOCKER_IMAGES, SERVICE_PORTS } from "@/lib/constants";
import { getTraefikConfig, getPortBinding } from "@/lib/docker-helpers";
import type { FullConfig } from "@/lib/config-schema";
import { CERT_RESOLVER_NAME } from "./traefik";

export const createPortainerService = (
  config: FullConfig
): Service => {
  const isTraefik = config.services.isTraefik && config.services.isTraefikPortainer;
  const { domain, labels } = getTraefikConfig(
    isTraefik,
    "portainer",
    config.services.portainerDomain,
    SERVICE_PORTS.portainer.toString(),
    CERT_RESOLVER_NAME
  );
  return ({
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    checked: config.services.isPortainer,
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
        ports: [getPortBinding(config.networkMode, 9443)],
        volumes: [
          "portainer_data:/data",
          "/var/run/docker.sock:/var/run/docker.sock",
        ],
        labels,
      },
    },
  });
};
