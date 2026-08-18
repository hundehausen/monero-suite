import { NetworkMode, Service } from "@/lib/service-types";
import { architectures } from "@/lib/service-types";
import { DOCKER_IMAGES, SERVICE_PORTS } from "@/lib/constants";
import { getPortBinding } from "@/lib/docker-helpers";
import { CUPRATE_BASH_COMMANDS } from "@/lib/script-generator";

// cuprated serves restricted RPC on 18089 (enabled by the mounted Cuprated.toml);
// 18080 is its P2P port and is intentionally not published.
const CUPRATE_CONTAINER_RPC_PORT = 18089;

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
  bash: CUPRATE_BASH_COMMANDS,
  code: {
    cuprate: {
      image: DOCKER_IMAGES.cuprate,
      container_name: "cuprate",
      restart: "unless-stopped",
      volumes: [
        "cuprate-data:/home/cuprate/.local/share/cuprate",
        // Downloaded by the install script from hundehausen/cuprate-docker.
        // The image ships an empty config dir; without this mount cuprated
        // disables RPC and its own healthcheck fails.
        "./cuprate/Cuprated.toml:/home/cuprate/.config/cuprate/Cuprated.toml:ro",
      ],
      ports: [getPortBinding(networkMode, SERVICE_PORTS.cuprateRpc, CUPRATE_CONTAINER_RPC_PORT)],
    },
  },
});
