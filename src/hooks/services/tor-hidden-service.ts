import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, architectures, p2poolModes, P2PoolMode } from "./types";

export const useTorHiddenServiceService = () => {
  const [isHiddenServices, setIsHiddenServices] = useQueryState(
    "isHiddenServices",
    parseAsBoolean.withDefault(false)
  );

  const getTorHiddenServiceService = (
    isStagenetNode: boolean,
    p2PoolMode: P2PoolMode,
    isMoneroblock: boolean,
    isOnionMoneroBlockchainExplorer: boolean,
    isMonitoring: boolean
  ): Service => ({
    name: "Tor Hidden Service",
    description:
      "Your own private Tor network for Monero and services like Moneroblock and P2Pool. You can share it with others or keep it to yourself.",
    checked: isHiddenServices,
    required: false,
    architecture: [architectures.linuxAmd],
    volumes: {
      "tor-keys": {},
    },
    code: {
      "tor-hidden-service": {
        image: "ghcr.io/sethforprivacy/tor:latest",
        container_name: "tor-hidden-service",
        restart: "unless-stopped",
        links: [
          "monerod",
          ...(isStagenetNode ? ["monerod-stagenet"] : []),
          ...(p2PoolMode !== p2poolModes.none ? ["p2pool"] : []),
          ...(isMoneroblock ? ["moneroblock"] : []),
          ...(isOnionMoneroBlockchainExplorer
            ? ["onion-monero-blockchain-explorer"]
            : []),
          ...(isMonitoring ? ["grafana"] : []),
        ],
        environment: {
          MONEROD_TOR_SERVICE_HOSTS: "18089:monerod:18089",
          ...(isStagenetNode
            ? {
                MONEROD_STAGENET_TOR_SERVICE_HOSTS:
                  "38089:monerod-stagenet:38089",
              }
            : {}),
          ...(p2PoolMode !== p2poolModes.none
            ? {
                P2POOL_TOR_SERVICE_HOSTS: "3333:p2pool:3333",
              }
            : {}),
          ...(isMoneroblock
            ? {
                MONEROBLOCK_TOR_SERVICE_HOSTS: "80:moneroblock:31312",
              }
            : {}),
          ...(isOnionMoneroBlockchainExplorer
            ? {
                MONERO_ONION_BLOCKCHAIN_EXPLORER_TOR_SERVICE_HOSTS:
                  "80:onion-monero-blockchain-explorer:8081",
              }
            : {}),
          ...(isMonitoring
            ? { GRAFANA_TOR_SERVICE_HOSTS: "80:grafana:3000" }
            : {}),
        },
        volumes: ["tor-keys:/var/lib/tor/hidden_service/"],
      },
    },
  });

  return {
    getTorHiddenServiceService,
    stateFunctions: {
      isHiddenServices,
      setIsHiddenServices,
    },
  };
};
