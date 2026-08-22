import { Service, architectures } from "@/lib/service-types";
import { DOCKER_IMAGES } from "@/lib/constants";
import type { FullConfig } from "@/lib/config-schema";

export const createWatchtowerService = (
  config: FullConfig
): Service => ({
  name: "Watchtower",
  description:
    "Automatically updates your Docker containers when new image versions are available. Keeps your Monero software up-to-date without manual intervention.",
  checked: config.services.isWatchtower,
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
