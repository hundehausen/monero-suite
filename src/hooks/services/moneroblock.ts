import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode, torProxyModes, TorProxyMode } from "./types";
import { MONEROD_IP, MONEROBLOCK_IP } from "./tor";
import { safeParse, domainSchema } from "@/lib/schemas";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTraefikLabels, getPortBinding, getTorNetworkConfig } from "@/lib/docker-helpers";

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
    const sDomain = safeParse(domainSchema, moneroBlockDomain, "");
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
        labels: getTraefikLabels(isTraefik, "moneroblock", sDomain, "31312", certResolverName),
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
