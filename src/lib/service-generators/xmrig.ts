import { Service, architectures, minigModes, MiningMode } from "@/hooks/services/types";
import { DOCKER_IMAGES, P2POOL_PORTS } from "@/lib/constants";

export const createXmrigService = (
  miningMode: MiningMode,
  xmrigDonateLevel: number
): Service => ({
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
      environment: {
        POOL_URL: `p2pool:${P2POOL_PORTS.stratum}`,
        POOL_USER: "xmrig",
        POOL_PASS: "",
        DONATE_LEVEL: xmrigDonateLevel,
      },
    },
  },
});
