import { useQueryState, parseAsStringEnum, parseAsInteger } from "nuqs";
import { Service, architectures, minigModes, MiningMode } from "./types";
import { DOCKER_IMAGES, P2POOL_PORTS } from "@/lib/constants";

export const useXmrigService = () => {
  const [miningMode, setMiningMode] = useQueryState<MiningMode>(
    "miningMode",
    parseAsStringEnum(Object.values(minigModes)).withDefault(minigModes.none)
  );
  const [xmrigDonateLevel, setXmrigDonateLevel] = useQueryState(
    "xmrigDonateLevel",
    parseAsInteger.withDefault(1)
  );

  const getXmrigService = (): Service => ({
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

  return {
    getXmrigService,
    stateFunctions: {
      miningMode,
      setMiningMode,
      xmrigDonateLevel,
      setXmrigDonateLevel,
    },
  };
};
