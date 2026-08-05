import { Service, architectures, TorProxyMode, torProxyModes } from "@/hooks/services/types";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTorClientNetworkConfig } from "@/lib/docker-helpers";

export const CERT_RESOLVER_NAME = "monerosuite";

export const createTraefikService = (
  isTraefik: boolean,
  torProxyMode: TorProxyMode = torProxyModes.none
): Service => ({
  name: "Traefik",
  description:
    "A reverse proxy that automatically handles HTTPS certificates and routes traffic to your services. Required for exposing services on custom domains.",
  checked: isTraefik,
  required: false,
  architecture: [architectures.linuxAmd, architectures.linuxArm],
  volumes: {
    letsencrypt: {},
  },
  code: {
    traefik: {
      image: DOCKER_IMAGES.traefik,
      container_name: "traefik",
      restart: "unless-stopped",
      command: [
        "--providers.docker=true",
        "--providers.docker.exposedbydefault=false",
        "--entrypoints.web.address=:80",
        "--entrypoints.websecure.address=:443",
        "--entrypoints.web.http.redirections.entrypoint.to=websecure",
        "--entrypoints.web.http.redirections.entrypoint.scheme=https",
        `--certificatesresolvers.${CERT_RESOLVER_NAME}.acme.tlschallenge=true`,
        `--certificatesresolvers.${CERT_RESOLVER_NAME}.acme.storage=/letsencrypt/acme.json`,
      ],
      ports: ["80:80", "443:443"],
      volumes: [
        "/var/run/docker.sock:/var/run/docker.sock",
        "letsencrypt:/letsencrypt",
      ],
      ...getTorClientNetworkConfig(torProxyMode),
    },
  },
  ufw: ["443/tcp", "80/tcp"],
});
