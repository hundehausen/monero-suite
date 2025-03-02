import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode, torProxyModes } from "./types";
import { MONEROD_IP, EXPLORER_IP } from "./tor";

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
  ): Service => ({
    name: "Onion Monero Blockchain Explorer",
    description:
      "Onion Monero Blockchain Explorer allows you to browse Monero blockchain. It uses no JavaScript, no cookies and no trackers.",
    checked: isOnionMoneroBlockchainExplorer,
    required: false,
    architecture: [architectures.linuxAmd],
    code: {
      "onion-monero-blockchain-explorer": {
        image: "vdo1138/xmrblocks:latest",
        restart: "unless-stopped",
        container_name: "onion-monero-blockchain-explorer",
        ports: [
          ...(networkMode === networkModes.local
            ? ["8081:8081"]
            : ["127.0.0.1:8081:8081"]),
        ],
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
              depends_on: ["monerod"],
              command: [
                "./xmrblocks --enable-json-api --enable-autorefresh-option --enable-emission-monitor --daemon-url=monerod:18089 --enable-pusher",
              ],
            }),
        labels: isTraefik
          ? {
              "traefik.enable": "true",
              "traefik.http.routers.onion-monero-blockchain-explorer.rule": `Host(\`${onionMoneroBlockchainExplorerDomain}\`)`,
              "traefik.http.routers.onion-monero-blockchain-explorer.entrypoints":
                "websecure",
              "traefik.http.routers.onion-monero-blockchain-explorer.tls.certresolver":
                certResolverName,
              "traefik.http.services.onion-monero-blockchain-explorer.loadbalancer.server.port":
                "8081",
            }
          : undefined,
      },
    },
  });

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
