import { Service, architectures, networkModes } from "@/lib/service-types";
import {
  DOCKER_IMAGES,
  MONEROD_BAN_LIST_PATH,
  MONEROD_FCMP_STRESSNET_PORTS,
} from "@/lib/constants";
import { getPortBinding, getP2pPortBinding } from "@/lib/docker-helpers";
import type { FullConfig } from "@/lib/config-schema";

const { p2p, rpcRestricted } = MONEROD_FCMP_STRESSNET_PORTS;

export const createMonerodFcmpStressnetService = (
  config: FullConfig
): Service => {
  const s = config.services;
  const networkMode = config.networkMode;
  return {
    name: "FCMP++ Stressnet Node (Experimental)",
    description:
      "Run monerod for the FCMP++ & Carrot beta stressnet on Monero's testnet. Beta software for testing only: never use it with mainnet funds. The anonymity set is tiny, and peers can see your IP address.",
    checked: s.isFcmpStressnet,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    ufw:
      s.isFcmpStressnetPublic && networkMode === networkModes.exposed
        ? [`${p2p}/tcp`, `${rpcRestricted}/tcp`]
        : undefined,
    volumes: {
      "bitmonero-fcmp-stressnet": {},
    },
    code: {
      "monerod-fcmp-stressnet": {
        image: DOCKER_IMAGES.monerodFcmpStressnet,
        restart: "unless-stopped",
        container_name: "monerod-fcmp-stressnet",
        volumes: ["bitmonero-fcmp-stressnet:/home/monero/.bitmonero"],
        ports: [
          ...getP2pPortBinding(s.isFcmpStressnetPublic, networkMode, p2p),
          getPortBinding(
            s.isFcmpStressnetPublic ? networkModes.local : networkMode,
            rpcRestricted
          ),
        ],
        // The image entrypoint prepends `monerod --non-interactive`; this
        // replaces the image CMD, so the testnet defaults are restated here.
        command: [
          "--testnet",
          "--rpc-restricted-bind-ip=0.0.0.0",
          `--rpc-restricted-bind-port=${rpcRestricted}`,
          "--confirm-external-bind",
          "--no-igd",
          "--no-zmq",
          "--enable-dns-blocklist",
          `--ban-list=${MONEROD_BAN_LIST_PATH}`,
          "--max-log-files=3",
          "--max-log-file-size=1048576",
          ...(s.isFcmpStressnetPublic ? ["--public-node"] : []),
          ...(s.isFcmpStressnetPruned ? ["--prune-blockchain"] : []),
        ],
      },
    },
  };
};
