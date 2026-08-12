import {
  Service,
  architectures,
  NetworkMode,
  P2PoolMode,
  TorProxyMode,
  torProxyModes,
  networkModes,
} from "@/hooks/services/types";
import { DOCKER_IMAGES, P2POOL_PORTS, SERVICE_PORTS } from "@/lib/constants";
import { getPortBinding, getTorClientNetworkConfig } from "@/lib/docker-helpers";
import { getP2PoolContainerName } from "@/lib/service-generators/p2pool";

export const createXmrigProxyService = (
  isXmrigProxy: boolean,
  p2PoolMode: P2PoolMode,
  networkMode: NetworkMode,
  isXmrigProxyPublic: boolean,
  torProxyMode: TorProxyMode = torProxyModes.none
): Service => {
  const p2poolHost = getP2PoolContainerName(p2PoolMode);
  return {
    name: "XMRig Proxy",
    description:
      "Stratum proxy in front of your P2Pool node. Point many miners at one connection. Listens on port " +
      SERVICE_PORTS.xmrigProxy +
      " (P2Pool keeps " +
      P2POOL_PORTS.stratum +
      ").",
    checked: isXmrigProxy,
    required: false,
    architecture: [architectures.linuxAmd],
    ufw:
      networkMode === networkModes.exposed && isXmrigProxy && isXmrigProxyPublic
        ? [`${SERVICE_PORTS.xmrigProxy}/tcp`]
        : undefined,
    code: {
      "xmrig-proxy": {
        image: DOCKER_IMAGES.xmrigProxy,
        restart: "unless-stopped",
        container_name: "xmrig-proxy",
        ports: [
          isXmrigProxyPublic
            ? `${SERVICE_PORTS.xmrigProxy}:${SERVICE_PORTS.xmrigProxy}`
            : getPortBinding(networkMode, SERVICE_PORTS.xmrigProxy),
        ],
        depends_on: { [p2poolHost]: { condition: "service_started" } },
        ...getTorClientNetworkConfig(torProxyMode),
        command: [
          "-o",
          `${p2poolHost}:${P2POOL_PORTS.stratum}`,
          "-u",
          "x",
          "-p",
          "x",
          "--bind",
          `0.0.0.0:${SERVICE_PORTS.xmrigProxy}`,
        ],
      },
    },
  };
};
