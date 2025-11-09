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

// Define fixed IP addresses for the tor network
export const TOR_IP = "172.28.1.2";
export const MONEROD_IP = "172.28.1.3";
export const MONEROD_STAGENET_IP = "172.28.1.4";
export const P2POOL_IP = "172.28.1.5";
export const MONEROBLOCK_IP = "172.28.1.6";
export const EXPLORER_IP = "172.28.1.7";
export const GRAFANA_IP = "172.28.1.8";

export const useTorService = ({ networkMode }: { networkMode: NetworkMode }) => {
  // State for Tor Proxy functionality
  const [torProxyMode, setTorProxyMode] = useQueryState<TorProxyMode>(
    "torProxyMode",
    parseAsStringEnum(Object.values(torProxyModes)).withDefault(
      torProxyModes.none
    )
  );

  // State for Tor Hidden Service functionality
  const [isHiddenServices, setIsHiddenServices] = useQueryState(
    "isHiddenServices",
    parseAsBoolean.withDefault(false)
  );

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
        "Tor services for Monero: proxy for anonymous transactions and hidden services for private network access.",
      checked: isTorEnabled,
      required: false,
      architecture: [architectures.linuxAmd, architectures.linuxArm],
      code: {
        tor: {
          image: "ghcr.io/hundehausen/tor-hidden-service:latest",
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
        monero_suite_net: {
          driver: "bridge",
          ipam: {
            config: [
              {
                subnet: "172.28.1.0/24"
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
      const portBinding = networkMode === networkModes.local ? "9050:9050" : "127.0.0.1:9050:9050";

      service.code.tor.ports = [portBinding];
    }

    // Add hidden service-specific configuration if hidden services are enabled
    if (isHiddenServices) {
      service.volumes = {
        "tor-data": {},
      };

      service.code.tor.volumes = ["tor-data:/var/lib/tor/"];

      // Add environment variables for hidden services
      service.code.tor.environment = {
        HS_MONEROD_MAINNET: `monerod:18089:18089`,
        ...(isStagenetNode
          ? {
            HS_MONEROD_MAINNET_STAGENET: `monerod-stagenet:38089:38089`,
          }
          : {}),
        ...(p2PoolMode === p2poolModes.full
          ? {
            HS_P2POOL: "p2pool:3333:3333",
          }
          : {}),
        ...(p2PoolMode === p2poolModes.mini
          ? {
            HS_P2POOL_MINI: "p2pool-mini:3333:3333",
          }
          : {}),
        ...(isMoneroblock
          ? {
            HS_MONEROBLOCK: "moneroblock:31312:80",
          }
          : {}),
        ...(isOnionMoneroBlockchainExplorer
          ? {
            HS_MONERO_ONION_BLOCKCHAIN_EXPLORER:
              "onion-monero-blockchain-explorer:8081:80",
          }
          : {}),
        ...(isMonitoring
          ? { HS_GRAFANA: "grafana:3000:80" }
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

      // Hidden service state functions
      isHiddenServices,
      setIsHiddenServices,

      // Global proxy state functions
      isGlobalTorProxy,
      setIsGlobalTorProxy,
    },
  };
};
