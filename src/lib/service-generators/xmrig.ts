import { Service, architectures, minigModes } from "@/lib/service-types";
import { DOCKER_IMAGES, P2POOL_PORTS, SERVICE_PORTS } from "@/lib/constants";
import { getTorClientNetworkConfig } from "@/lib/docker-helpers";
import { getP2PoolContainerName } from "@/lib/service-generators/p2pool";
import type { FullConfig } from "@/lib/config-schema";
import type { GenerationCtx } from "./ctx";

export const createXmrigService = (
  config: FullConfig,
  ctx: GenerationCtx
): Service => {
  const { miningMode, xmrigDonateLevel } = config.mining;
  const p2poolHost = getP2PoolContainerName(config.p2pool.p2PoolMode);
  const poolUrl = ctx.isXmrigProxyOn
    ? `xmrig-proxy:${SERVICE_PORTS.xmrigProxy}`
    : `${p2poolHost}:${P2POOL_PORTS.stratum}`;

  return {
    name: "XMRig",
    description:
      "A high-performance CPU miner for Monero. More efficient than P2Pool's built-in miner, but requires running P2Pool alongside it.",
    checked: miningMode === minigModes.xmrig,
    required: false,
    architecture: [architectures.linuxAmd],
    code: {
      xmrig: {
        image: DOCKER_IMAGES.xmrig,
        container_name: "xmrig",
        restart: "unless-stopped",
        cap_add: ["SYS_ADMIN", "SYS_RAWIO"],
        devices: ["/dev/cpu", "/dev/mem"],
        volumes: ["/lib/modules:/lib/modules"],
        ...getTorClientNetworkConfig(config.tor.torProxyMode),
        environment: {
          POOL_URL: poolUrl,
          POOL_USER: "xmrig",
          POOL_PASS: "",
          DONATE_LEVEL: xmrigDonateLevel,
        },
        ...(ctx.isXmrigProxyOn
          ? { depends_on: { "xmrig-proxy": { condition: "service_started" } } }
          : {}),
      },
    },
  };
};
