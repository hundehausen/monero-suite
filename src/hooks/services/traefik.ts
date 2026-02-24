import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, architectures } from "./types";
import { DOCKER_IMAGES } from "@/lib/constants";

export const CERT_RESOLVER_NAME = "monerosuite";

export const useTraefikService = () => {
  const [isTraefik, setIsTraefik] = useQueryState(
    "isTraefik",
    parseAsBoolean.withDefault(false)
  );
  const [isTraefikMonerod, setIsTraefikMonerod] = useQueryState(
    "isTraefikMonerod",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikStagenet, setIsTraefikStagenet] = useQueryState(
    "isTraefikStagenet",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikMoneroblock, setIsTraefikMoneroblock] = useQueryState(
    "isTraefikMoneroblock",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikOnionExplorer, setIsTraefikOnionExplorer] = useQueryState(
    "isTraefikOnionExplorer",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikGrafana, setIsTraefikGrafana] = useQueryState(
    "isTraefikGrafana",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikPortainer, setIsTraefikPortainer] = useQueryState(
    "isTraefikPortainer",
    parseAsBoolean.withDefault(true)
  );

  const getTraefikService = (): Service => {
    return {
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
      isTraefikMonerod,
      setIsTraefikMonerod,
      isTraefikStagenet,
      setIsTraefikStagenet,
      isTraefikMoneroblock,
      setIsTraefikMoneroblock,
      isTraefikOnionExplorer,
      setIsTraefikOnionExplorer,
      isTraefikGrafana,
      setIsTraefikGrafana,
      isTraefikPortainer,
      setIsTraefikPortainer,
    },
  };
};
