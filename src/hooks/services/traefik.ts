import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, architectures } from "./types";
import { DOCKER_IMAGES } from "@/lib/constants";

export const CERT_RESOLVER_NAME = "monerosuite";

export const useTraefikService = () => {
  const [isTraefik, setIsTraefik] = useQueryState(
    "isTraefik",
    parseAsBoolean.withDefault(false)
  );

  const getTraefikService = (): Service => {
    return {
      name: "Traefik",
      description:
        "Traefik is a modern HTTP reverse proxy and load balancer that makes deploying microservices easy.",
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
        },
      },
      ufw: ["443/tcp", "80/tcp"],
    };
  };

  return {
    getTraefikService,
    stateFunctions: {
      isTraefik,
      setIsTraefik,
    },
  };
};
