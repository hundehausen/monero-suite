import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, architectures } from "./types";
import { DOCKER_IMAGES } from "@/lib/constants";

export const useWatchtowerService = () => {
  const [isWatchtower, setIsWatchtower] = useQueryState(
    "isWatchtower",
    parseAsBoolean.withDefault(false)
  );

  const getWatchtowerService = (): Service => ({
    name: "Watchtower",
    description:
      "Automatically updates your Docker containers when new image versions are available. Keeps your Monero software up-to-date without manual intervention.",
    checked: isWatchtower,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    code: {
      watchtower: {
        image: DOCKER_IMAGES.watchtower,
        container_name: "watchtower",
        restart: "unless-stopped",
        environment: {
          WATCHTOWER_CLEANUP: true,
          WATCHTOWER_POLL_INTERVAL: 3600,
        },
        volumes: ["/var/run/docker.sock:/var/run/docker.sock"],
      },
    },
  });

  return {
    getWatchtowerService,
    stateFunctions: {
      isWatchtower,
      setIsWatchtower,
    },
  };
};
