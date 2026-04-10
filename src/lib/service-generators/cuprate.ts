import { NetworkMode, Service } from "@/hooks/services/types";
import { architectures } from "@/hooks/services/types";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getPortBinding } from "@/lib/docker-helpers";

export const createCuprateService = (
  isCuprateEnabled: boolean,
  networkMode: NetworkMode
): Service => ({
  name: "Cuprate (Experimental)",
  description: "An alternative Monero node written in Rust. Currently experimental - use for testing only, not for production or storing real funds.",
  checked: isCuprateEnabled,
  required: false,
  architecture: [architectures.linuxAmd, architectures.linuxArm],
  volumes: {
    "cuprate-data": {},
  },
  code: {
    cuprate: {
      image: DOCKER_IMAGES.cuprate,
      container_name: "cuprate",
      restart: "unless-stopped",
      volumes: [
        "cuprate-data:/home/cuprate/.local/share/cuprate"
      ],
      ports: [getPortBinding(networkMode, 18082, 18080)],
      networks: ["monero-network"],
    },
  },
  networks: {
    "monero-network": {
      external: false,
    },
  },
});
