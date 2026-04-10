import { Service, architectures } from "@/hooks/services/types";
import { DOCKER_IMAGES } from "@/lib/constants";

export const createAutohealService = (
  isAutoheal: boolean
): Service => ({
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
