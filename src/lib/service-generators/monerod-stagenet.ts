import { Service, architectures, networkModes, torProxyModes } from "@/lib/service-types";
import { TOR_IP, MONEROD_STAGENET_IP } from "@/lib/service-constants";
import { safeParse, pathSchema } from "@/lib/schemas";
import { DOCKER_IMAGES, MONEROD_BAN_LIST_PATH, MONEROD_STAGENET_PORTS } from "@/lib/constants";
import { getTraefikConfig, getPortBinding, getTorNetworkConfig } from "@/lib/docker-helpers";
import type { FullConfig } from "@/lib/config-schema";
import { CERT_RESOLVER_NAME } from "./traefik";

export const createMonerodStagenetService = (
  config: FullConfig
): Service => {
  const state = config.stagenet;
  const moneroNodeNoLogs = config.monerod.moneroNodeNoLogs;
  const networkMode = config.networkMode;
  const isTraefik = config.services.isTraefik && config.services.isTraefikStagenet;
  const torProxyMode = config.tor.torProxyMode;
  const { labels } = getTraefikConfig(isTraefik, "monerod-stagenet", state.stagenetNodeDomain, MONEROD_STAGENET_PORTS.rpcRestricted.toString(), CERT_RESOLVER_NAME);
  const sPath = safeParse(pathSchema, state.moneroStagenetBlockchainLocation, "~/.bitmonero");
  return ({
    name: "Monero Stagenet Node",
    description:
      "Run a node on Monero's test network (stagenet). Perfect for developers testing integrations or users learning how Monero works without using real funds.",
    checked: state.isStagenetNode,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    ufw:
      state.isStagenetNodePublic && networkMode === networkModes.exposed
        ? ["38080/tcp", "38089/tcp"]
        : undefined,
    volumes: !state.isMoneroStagenetCustomLocation
      ? {
          "bitmonero-stagenet": {},
        }
      : undefined,
    code: {
      "monerod-stagenet": {
        image: DOCKER_IMAGES.monerod,
        restart: "unless-stopped",
        container_name: "monerod-stagenet",
        volumes: [
          ...(!state.isMoneroStagenetCustomLocation
            ? ["bitmonero-stagenet:/home/monero/.bitmonero"]
            : [
                `${sPath}:/home/monero/.bitmonero`,
              ]),
        ],
        ports: [
          getPortBinding(state.isStagenetNodePublic ? networkModes.local : networkMode, 38080),
          getPortBinding(state.isStagenetNodePublic ? networkModes.local : networkMode, 38089),
        ],
        depends_on:
          torProxyMode !== torProxyModes.none
            ? {
                tor: {
                  condition: "service_started",
                },
              }
            : undefined,
        ...getTorNetworkConfig(torProxyMode, MONEROD_STAGENET_IP),
        command: [
          "--stagenet",
          "--rpc-restricted-bind-ip=0.0.0.0",
          "--rpc-restricted-bind-port=38089",
          "--rpc-bind-ip=0.0.0.0",
          "--rpc-bind-port=38081",
          "--confirm-external-bind",
          "--enable-dns-blocklist",
          `--ban-list=${MONEROD_BAN_LIST_PATH}`,
          "--check-updates=disabled",
          ...(moneroNodeNoLogs
            ? ["--log-file=/dev/null", "--max-log-file-size=0"]
            : ["--max-log-files=3", "--max-log-file-size=1048576"]),
          "--out-peers=64",
          "--limit-rate-down=1048576",
          ...(state.isStagenetNodePublic ? ["--public-node"] : []),
          ...(torProxyMode === torProxyModes.full
            ? [`--proxy=${TOR_IP}:9050`]
            : []),
          ...(torProxyMode !== torProxyModes.none
            ? [`--tx-proxy=tor,${TOR_IP}:9050,32`]
            : []),
        ],
        logging: moneroNodeNoLogs ? { driver: "none" } : undefined,
        labels,
      },
    },
  });
};
