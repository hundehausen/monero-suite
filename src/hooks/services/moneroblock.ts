import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode, torProxyModes, TorProxyMode } from "./types";
import { MONEROD_IP, MONEROBLOCK_IP } from "./tor";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTraefikConfig, getPortBinding, getTorNetworkConfig } from "@/lib/docker-helpers";

export const useMoneroblockService = () => {
  const [isMoneroblock, setIsMoneroblock] = useQueryState(
    "isMoneroblock",
    parseAsBoolean.withDefault(false)
  );
  const [isMoneroblockLogging, setIsMoneroblockLogging] = useQueryState(
    "isMoneroblockLogging",
    parseAsBoolean.withDefault(true)
  );
  const [moneroBlockDomain, setMoneroBlockDomain] = useQueryState(
    "moneroBlockDomain",
    parseAsString.withDefault("explorer.example.com")
  );

  const getMoneroblockService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service => {
    const { labels } = getTraefikConfig(isTraefik, "moneroblock", moneroBlockDomain, "31312", certResolverName);
    return ({
    name: "Moneroblock",
    description: "Moneroblock is a self-hostable block explorer for monero",
    checked: isMoneroblock,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    code: {
      moneroblock: {
        image: DOCKER_IMAGES.moneroblock,
        restart: "unless-stopped",
        container_name: "moneroblock",
        ports: [getPortBinding(networkMode, 31312)],
        ...getTorNetworkConfig(torProxyMode, MONEROBLOCK_IP),
        command: torProxyMode !== torProxyModes.none
          ? [`--daemon ${MONEROD_IP}:18089`]
          : ["--daemon", "monerod:18089"],
        depends_on: {
          monerod: {
            condition: "service_started",
          },
        },
        labels,
        logging: !isMoneroblockLogging
          ? {
            driver: "none",
          }
          : undefined,
      },
    },
  });
  };

  return {
    getMoneroblockService,
    stateFunctions: {
      isMoneroblock,
      setIsMoneroblock,
      isMoneroblockLogging,
      setIsMoneroblockLogging,
      moneroBlockDomain,
      setMoneroBlockDomain,
    },
  };
};
