import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode, torProxyModes } from "./types";
import { MONEROD_IP, EXPLORER_IP } from "./tor";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTraefikConfig, getPortBinding } from "@/lib/docker-helpers";

export const useOnionMoneroBlockchainExplorerService = () => {
  const [isOnionMoneroBlockchainExplorer, setIsOnionMoneroBlockchainExplorer] =
    useQueryState(
      "isOnionMoneroBlockchainExplorer",
      parseAsBoolean.withDefault(false)
    );
  const [
    onionMoneroBlockchainExplorerDomain,
    setOnionMoneroBlockchainExplorerDomain,
  ] = useQueryState(
    "onionMoneroBlockchainExplorerDomain",
    parseAsString.withDefault("")
  );

  const getOnionMoneroBlockchainExplorerService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: string = torProxyModes.none
  ): Service => {
    const { labels } = getTraefikConfig(isTraefik, "onion-monero-blockchain-explorer", onionMoneroBlockchainExplorerDomain, "8081", certResolverName);
    return ({
    name: "Onion Monero Blockchain Explorer",
    description:
      "Onion Monero Blockchain Explorer allows you to browse Monero blockchain. It uses no JavaScript, no cookies and no trackers.",
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
        // Add network configuration if Tor proxy is enabled
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

  return {
    getOnionMoneroBlockchainExplorerService,
    stateFunctions: {
      isOnionMoneroBlockchainExplorer,
      setIsOnionMoneroBlockchainExplorer,
      onionMoneroBlockchainExplorerDomain,
      setOnionMoneroBlockchainExplorerDomain,
    },
  };
};
