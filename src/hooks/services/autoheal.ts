import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, architectures } from "./types";

export const useAutohealService = () => {
  const [isAutoheal, setIsAutoheal] = useQueryState(
    "isAutoheal",
    parseAsBoolean.withDefault(false)
  );

  const getAutohealService = (): Service => ({
    name: "Autoheal",
    description:
      "Autoheal is a simple Docker container that will monitor and restart unhealthy docker containers.",
    checked: isAutoheal,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    code: {
      autoheal: {
        image: "willfarrell/autoheal:latest",
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
