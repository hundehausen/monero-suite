import { Service, architectures, torProxyModes, TorProxyMode, NetworkMode, p2poolModes, P2PoolMode } from "@/hooks/services/types";
import { TOR_IP } from "@/lib/service-constants";
import { DOCKER_NETWORK, DOCKER_IMAGES, SERVICE_PORTS, P2POOL_PORTS, MONEROD_PORTS, MONEROD_STAGENET_PORTS } from "@/lib/constants";
import { getPortBinding } from "@/lib/docker-helpers";

interface TorDataConfig {
  torProxyMode: TorProxyMode;
  hsMonerod: boolean;
  hsMonerodP2P: boolean;
  hsStagenet: boolean;
  hsP2Pool: boolean;
  hsMoneroblock: boolean;
  hsOnionExplorer: boolean;
  hsGrafana: boolean;
  isGlobalTorProxy: boolean;
}

export const createTorService = (
  state: TorDataConfig,
  networkMode: NetworkMode,
  isStagenetNode: boolean = false,
  p2PoolMode: P2PoolMode = p2poolModes.none,
  isMoneroblock: boolean = false,
  isOnionMoneroBlockchainExplorer: boolean = false,
  isMonitoring: boolean = false
): Service => {
  const {
    torProxyMode,
    hsMonerod,
    hsMonerodP2P,
    hsStagenet,
    hsP2Pool,
    hsMoneroblock,
    hsOnionExplorer,
    hsGrafana,
    isGlobalTorProxy,
  } = state;

  const isHiddenServices = hsMonerod || hsMonerodP2P || hsStagenet || hsP2Pool || hsMoneroblock || hsOnionExplorer || hsGrafana;
  const isTorEnabled = torProxyMode !== torProxyModes.none || isHiddenServices;
  const isProxyEnabled = torProxyMode !== torProxyModes.none;

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

  if (isProxyEnabled) {
    service.code.tor.networks = {
      monero_suite_net: {
        ipv4_address: TOR_IP,
        aliases: ["tor"]
      }
    };

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

  if (isProxyEnabled && isGlobalTorProxy) {
    service.code.tor.ports = [getPortBinding(networkMode, SERVICE_PORTS.torSocks)];
  }

  if (isHiddenServices) {
    service.volumes = {
      "tor-data": {},
    };

    service.code.tor.volumes = ["tor-data:/var/lib/tor/"];

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
