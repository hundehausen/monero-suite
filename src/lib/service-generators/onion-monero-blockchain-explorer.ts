import { Service, architectures, NetworkMode, torProxyModes, TorProxyMode } from "@/hooks/services/types";
import { MONEROD_IP, EXPLORER_IP } from "@/lib/service-constants";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTraefikConfig, getPortBinding } from "@/lib/docker-helpers";

export const createOnionMoneroBlockchainExplorerService = (
  isOnionMoneroBlockchainExplorer: boolean,
  onionMoneroBlockchainExplorerDomain: string,
  networkMode: NetworkMode,
  isTraefik: boolean,
  certResolverName: string = "monerosuite",
  torProxyMode: TorProxyMode = torProxyModes.none
): Service => {
  const { labels } = getTraefikConfig(isTraefik, "onion-monero-blockchain-explorer", onionMoneroBlockchainExplorerDomain, "8081", certResolverName);
  return ({
    name: "Onion Monero Blockchain Explorer",
    description:
      "A lightweight, privacy-focused block explorer with no JavaScript, cookies, or trackers. Browse the Monero blockchain without sacrificing your privacy.",
    checked: isOnionMoneroBlockchainExplorer,
    required: false,
    architecture: [architectures.linuxAmd],
    code: {
      "onion-monero-blockchain-explorer": {
        image: DOCKER_IMAGES.explorerOnion,
        restart: "unless-stopped",
        container_name: "onion-monero-blockchain-explorer",
        ports: [getPortBinding(networkMode, 8081)],
        volumes: ["monero-data:/home/monero/.bitmonero"],
        ...(torProxyMode !== torProxyModes.none
          ? {
            networks: {
              monero_suite_net: {
                ipv4_address: EXPLORER_IP
              }
            },
            depends_on: {
              tor: {
                condition: "service_started",
              },
              monerod: {
                condition: "service_started",
              },
            },
            command: [
              `./xmrblocks --enable-json-api --enable-autorefresh-option --enable-emission-monitor --daemon-url=${MONEROD_IP}:18089 --enable-pusher`,
            ],
          }
          : {
            depends_on: {
              monerod: {
                condition: "service_started",
              },
            },
            command: [
              "./xmrblocks --enable-json-api --enable-autorefresh-option --enable-emission-monitor --daemon-url=monerod:18089 --enable-pusher",
            ],
          }),
        labels,
      },
    },
  });
};
