import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";
import {
  Service,
  architectures,
  networkModes,
  torProxyModes,
  TorProxyMode,
  NetworkMode,
  p2poolModes,
  P2PoolMode,
} from "./types";
import { useEffect } from "react";

import { SERVICE_IPS, DOCKER_NETWORK, DOCKER_IMAGES, SERVICE_PORTS, P2POOL_PORTS, MONEROD_PORTS, MONEROD_STAGENET_PORTS } from "@/lib/constants";
import { getPortBinding } from "@/lib/docker-helpers";

export const TOR_IP = SERVICE_IPS.tor;
export const MONEROD_IP = SERVICE_IPS.monerod;
export const MONEROD_STAGENET_IP = SERVICE_IPS.monerodStagenet;
export const P2POOL_IP = SERVICE_IPS.p2pool;
export const MONEROBLOCK_IP = SERVICE_IPS.moneroblock;
export const EXPLORER_IP = SERVICE_IPS.explorer;
export const GRAFANA_IP = SERVICE_IPS.grafana;

export const useTorService = ({ networkMode }: { networkMode: NetworkMode }) => {
  // State for Tor Proxy functionality
  const [torProxyMode, setTorProxyMode] = useQueryState<TorProxyMode>(
    "torProxyMode",
    parseAsStringEnum(Object.values(torProxyModes)).withDefault(
      torProxyModes.none
    )
  );

  // Per-service hidden service toggles
  const [hsMonerod, setHsMonerod] = useQueryState("hsMonerod", parseAsBoolean.withDefault(false));
  const [hsMonerodP2P, setHsMonerodP2P] = useQueryState("hsMonerodP2P", parseAsBoolean.withDefault(false));
  const [hsStagenet, setHsStagenet] = useQueryState("hsStagenet", parseAsBoolean.withDefault(false));
  const [hsP2Pool, setHsP2Pool] = useQueryState("hsP2Pool", parseAsBoolean.withDefault(false));
  const [hsMoneroblock, setHsMoneroblock] = useQueryState("hsMoneroblock", parseAsBoolean.withDefault(false));
  const [hsOnionExplorer, setHsOnionExplorer] = useQueryState("hsOnionExplorer", parseAsBoolean.withDefault(false));
  const [hsGrafana, setHsGrafana] = useQueryState("hsGrafana", parseAsBoolean.withDefault(false));

  // Derived: true if any hidden service is enabled
  const isHiddenServices = hsMonerod || hsMonerodP2P || hsStagenet || hsP2Pool || hsMoneroblock || hsOnionExplorer || hsGrafana;

  // State for global Tor proxy (binding to 0.0.0.0)
  const [isGlobalTorProxy, setIsGlobalTorProxy] = useQueryState(
    "isGlobalTorProxy",
    parseAsBoolean.withDefault(false)
  );

  useEffect(() => {
    if (networkMode === networkModes.exposed) {
      setIsGlobalTorProxy(false);
    }
  }, [networkMode, setIsGlobalTorProxy]);

  const getTorService = (
    networkMode: NetworkMode,
    isStagenetNode: boolean = false,
    p2PoolMode: P2PoolMode = p2poolModes.none,
    isMoneroblock: boolean = false,
    isOnionMoneroBlockchainExplorer: boolean = false,
    isMonitoring: boolean = false
  ): Service => {
    // Determine if either proxy or hidden services are enabled
    const isTorEnabled = torProxyMode !== torProxyModes.none || isHiddenServices;
    const isProxyEnabled = torProxyMode !== torProxyModes.none;

    // Base service configuration
    const service: Service = {
    name: "Tor Service",
    description:
      "Route your Monero traffic through the Tor network for enhanced privacy. Includes both a proxy for anonymous transactions and hidden services for private access to your node.",
      checked: isTorEnabled,
      required: false,
      architecture: [architectures.linuxAmd, architectures.linuxArm],
      code: {
        tor: {
          image: DOCKER_IMAGES.tor,
          container_name: "tor",
          restart: "unless-stopped",
        },
      },
    };

    // Add custom network if proxy is enabled
    if (isProxyEnabled) {
      service.code.tor.networks = {
        monero_suite_net: {
          ipv4_address: TOR_IP,
          aliases: ["tor"]
        }
      };

      // Add network definition to the service
      service.networks = {
        [DOCKER_NETWORK.name]: {
          driver: DOCKER_NETWORK.driver,
          ipam: {
            config: [
              {
                subnet: DOCKER_NETWORK.subnet,
              }
            ]
          }
        }
      };
    }

    // Add proxy-specific configuration if proxy is enabled
    if (isProxyEnabled && isGlobalTorProxy) {
      // Determine port binding based on network mode and global proxy setting
      // Only allow host binding proxy (0.0.0.0) if in local network mode
      service.code.tor.ports = [getPortBinding(networkMode, SERVICE_PORTS.torSocks)];
    }

    // Add hidden service-specific configuration if any hidden service is enabled
    if (isHiddenServices) {
      service.volumes = {
        "tor-data": {},
      };

      service.code.tor.volumes = ["tor-data:/var/lib/tor/"];

      // Add environment variables for individually selected hidden services
      service.code.tor.environment = {
        ...(hsMonerod
          ? { HS_MONEROD_MAINNET: `monerod:${MONEROD_PORTS.rpcRestricted}:${MONEROD_PORTS.rpcRestricted}` }
          : {}),
        ...(hsMonerodP2P
          ? { HS_MONEROD_P2P: `monerod:${MONEROD_PORTS.torP2p}:${MONEROD_PORTS.torP2p}` }
          : {}),
        ...(hsStagenet && isStagenetNode
          ? { HS_MONEROD_MAINNET_STAGENET: `monerod-stagenet:${MONEROD_STAGENET_PORTS.rpcRestricted}:${MONEROD_STAGENET_PORTS.rpcRestricted}` }
          : {}),
        ...(hsP2Pool && p2PoolMode === p2poolModes.full
          ? { HS_P2POOL: `p2pool:${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}` }
          : {}),
        ...(hsP2Pool && p2PoolMode === p2poolModes.mini
          ? { HS_P2POOL_MINI: `p2pool-mini:${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}` }
          : {}),
        ...(hsP2Pool && p2PoolMode === p2poolModes.nano
          ? { HS_P2POOL_NANO: `p2pool-nano:${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}` }
          : {}),
        ...(hsMoneroblock && isMoneroblock
          ? { HS_MONEROBLOCK: `moneroblock:${SERVICE_PORTS.moneroblock}:80` }
          : {}),
        ...(hsOnionExplorer && isOnionMoneroBlockchainExplorer
          ? { HS_MONERO_ONION_BLOCKCHAIN_EXPLORER: `onion-monero-blockchain-explorer:${SERVICE_PORTS.explorerOnion}:80` }
          : {}),
        ...(hsGrafana && isMonitoring
          ? { HS_GRAFANA: `grafana:${SERVICE_PORTS.grafana}:80` }
          : {}),
      };
    }

    return service;
  };

  return {
    getTorService,
    stateFunctions: {
      // Proxy state functions
      torProxyMode,
      setTorProxyMode,

      // Hidden service state functions (per-service toggles)
      isHiddenServices,
      hsMonerod,
      setHsMonerod,
      hsMonerodP2P,
      setHsMonerodP2P,
      hsStagenet,
      setHsStagenet,
      hsP2Pool,
      setHsP2Pool,
      hsMoneroblock,
      setHsMoneroblock,
      hsOnionExplorer,
      setHsOnionExplorer,
      hsGrafana,
      setHsGrafana,

      // Global proxy state functions
      isGlobalTorProxy,
      setIsGlobalTorProxy,
    },
  };
};
