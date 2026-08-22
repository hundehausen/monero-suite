import {
  Service,
  Architecture,
  architectures,
  P2PoolMode,
  networkModes,
} from "@/lib/service-types";
import { DOCKER_IMAGES, P2POOL_PORTS, SERVICE_PORTS } from "@/lib/constants";
import { getPortBinding, getTorClientNetworkConfig } from "@/lib/docker-helpers";
import { getP2PoolContainerName } from "@/lib/service-generators/p2pool";
import type { FullConfig } from "@/lib/config-schema";
import type { GenerationCtx } from "./ctx";

/** True only when the proxy container can actually run (P2Pool + amd64). */
export function isXmrigProxyEffective(
  isXmrigProxy: boolean,
  p2PoolMode: P2PoolMode,
  architecture: Architecture
): boolean {
  return (
    isXmrigProxy &&
    p2PoolMode !== "none" &&
    architecture === architectures.linuxAmd
  );
}

export const createXmrigProxyService = (
  config: FullConfig,
  ctx: GenerationCtx
): Service => {
  const p2PoolMode = config.p2pool.p2PoolMode;
  const networkMode = config.networkMode;
  const isXmrigProxyPublic = config.services.isXmrigProxyPublic;
  const p2poolHost = getP2PoolContainerName(p2PoolMode);
  const proxyOn = ctx.isXmrigProxyOn;
  return {
    name: "XMRig Proxy",
    description:
      "Stratum proxy in front of your P2Pool node. Point many miners at one connection. Listens on port " +
      SERVICE_PORTS.xmrigProxy +
      " (P2Pool keeps " +
      P2POOL_PORTS.stratum +
      ").",
    checked: proxyOn,
    required: false,
    architecture: [architectures.linuxAmd],
    ufw:
      networkMode === networkModes.exposed && proxyOn && isXmrigProxyPublic
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
        ...getTorClientNetworkConfig(config.tor.torProxyMode),
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
