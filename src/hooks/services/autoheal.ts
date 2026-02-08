import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, architectures } from "./types";
import { DOCKER_IMAGES } from "@/lib/constants";

export const useAutohealService = () => {
  const [isAutoheal, setIsAutoheal] = useQueryState(
    "isAutoheal",
    parseAsBoolean.withDefault(false)
  );

  const getAutohealService = (): Service => ({
    name: "Autoheal",
    description:
      "Monitors your containers and automatically restarts any that become unresponsive or unhealthy. Helps keep your node running 24/7.",
    checked: isAutoheal,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    code: {
      autoheal: {
        image: DOCKER_IMAGES.autoheal,
        container_name: "autoheal",
        restart: "unless-stopped",
        environment: {
          AUTOHEAL_CONTAINER_LABEL: "all",
        },
        volumes: ["/var/run/docker.sock:/var/run/docker.sock"],
      },
    },
  });

  return {
    getAutohealService,
    stateFunctions: {
      isAutoheal,
      setIsAutoheal,
    },
  };
};
