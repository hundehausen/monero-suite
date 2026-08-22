import { Service, architectures, torProxyModes, p2poolModes } from "@/lib/service-types";
import { TOR_IP } from "@/lib/service-constants";
import { DOCKER_NETWORK, DOCKER_IMAGES, SERVICE_PORTS, P2POOL_PORTS, MONEROD_PORTS, MONEROD_STAGENET_PORTS } from "@/lib/constants";
import { getPortBinding } from "@/lib/docker-helpers";
import type { FullConfig } from "@/lib/config-schema";
import type { GenerationCtx } from "./ctx";

export const createTorService = (
  config: FullConfig,
  ctx: GenerationCtx
): Service => {
  const {
    torProxyMode,
    hsMonerod,
    hsMonerodP2P,
    hsStagenet,
    hsP2Pool,
    hsGrafana,
    hsLws,
    hsMoneroPay,
    hsXmrigProxy,
    isGlobalTorProxy,
  } = config.tor;
  const networkMode = config.networkMode;
  const isStagenetNode = config.stagenet.isStagenetNode;
  const p2PoolMode = config.p2pool.p2PoolMode;
  const isMonitoring = config.services.isMonitoring;
  const isMoneroLws = config.services.isMoneroLws;
  const isMoneroPay = config.services.isMoneroPay;
  const isXmrigProxy = ctx.isXmrigProxyOn;

  const isHiddenServices = ctx.anyHiddenService;
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
    // Stay on default so non-Tor peers can still resolve "tor" if needed;
    // static IP on tor-proxy is what monerod --tx-proxy/--proxy use.
    service.code.tor.networks = {
      default: {},
      [DOCKER_NETWORK.name]: {
        ipv4_address: TOR_IP,
        aliases: ["tor"],
      },
    };

    service.networks = {
      [DOCKER_NETWORK.name]: {
        driver: DOCKER_NETWORK.driver,
        ipam: {
          config: [
            {
              subnet: DOCKER_NETWORK.subnet,
            },
          ],
        },
      },
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
      ...(hsGrafana && isMonitoring
        ? { HS_GRAFANA: `grafana:${SERVICE_PORTS.grafana}:80` }
        : {}),
      ...(hsLws && isMoneroLws
        ? { HS_MONERO_LWS: `monero-lws:${SERVICE_PORTS.moneroLws}:${SERVICE_PORTS.moneroLws}` }
        : {}),
      ...(hsMoneroPay && isMoneroPay
        ? { HS_MONEROPAY: `moneropay:${SERVICE_PORTS.moneroPay}:${SERVICE_PORTS.moneroPay}` }
        : {}),
      ...(hsXmrigProxy && isXmrigProxy
        ? { HS_XMRIG_PROXY: `xmrig-proxy:${SERVICE_PORTS.xmrigProxy}:${SERVICE_PORTS.xmrigProxy}` }
        : {}),
    };
  }

  return service;
};
