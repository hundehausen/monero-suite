import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode } from "./types";

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
    isTraefik: boolean
  ): Service => ({
    name: "Onion Monero Blockchain Explorer",
    description:
      "Onion Monero Blockchain Explorer allows you to browse Monero blockchain. It uses no JavaScript, no cookies and no trackers.",
    checked: isOnionMoneroBlockchainExplorer,
    required: false,
    architecture: [architectures.linuxAmd],
    code: {
      onionMoneroBlockchainExplorer: {
        image: "vdo1138/xmrblocks:latest",
        restart: "unless-stopped",
        container_name: "onion-monero-blockchain-explorer",
        ports: [
          ...(networkMode === networkModes.local
            ? ["8081:8081"]
            : ["127.0.0.1:8081:8081"]),
        ],
        volumes: ["bitmonero:/home/monero/.bitmonero"],
        depends_on: ["monerod"],
        command: [
          "./xmrblocks --enable-json-api --enable-autorefresh-option --enable-emission-monitor --daemon-url=monerod:18089 --enable-pusher",
        ],
        labels: isTraefik
          ? {
              "traefik.enable": "true",
              "traefik.http.routers.onion-monero-blockchain-explorer.rule": `Host(\`${onionMoneroBlockchainExplorerDomain}\`)`,
              "traefik.http.routers.onion-monero-blockchain-explorer.entrypoints":
                "websecure",
              "traefik.http.routers.onion-monero-blockchain-explorer.tls.certresolver":
                "monerosuite",
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
