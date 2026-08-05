import { Service, architectures, minigModes, MiningMode, TorProxyMode, torProxyModes, P2PoolMode, p2poolModes } from "@/hooks/services/types";
import { DOCKER_IMAGES, P2POOL_PORTS } from "@/lib/constants";
import { getTorClientNetworkConfig } from "@/lib/docker-helpers";
import { getP2PoolContainerName } from "@/lib/service-generators/p2pool";

export const createXmrigService = (
  miningMode: MiningMode,
  xmrigDonateLevel: number,
  torProxyMode: TorProxyMode = torProxyModes.none,
  p2PoolMode: P2PoolMode = p2poolModes.full
): Service => {
  const p2poolHost = getP2PoolContainerName(p2PoolMode);

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
        ...getTorClientNetworkConfig(torProxyMode),
        environment: {
          POOL_URL: `${p2poolHost}:${P2POOL_PORTS.stratum}`,
          POOL_USER: "xmrig",
          POOL_PASS: "",
          DONATE_LEVEL: xmrigDonateLevel,
        },
      },
    },
  };
};
