import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode } from "./types";

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
    parseAsString.withDefault("explorer.monerosuite.org")
  );

  const getMoneroblockService = (
    networkMode: NetworkMode,
    isTraefik: boolean
  ): Service => ({
    name: "Moneroblock",
    description: "Moneroblock is a self-hostable block explorer for monero",
    checked: isMoneroblock,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    code: {
      moneroblock: {
        image: "sethsimmons/moneroblock:latest",
        restart: "unless-stopped",
        container_name: "moneroblock",
        ports: [
          ...(networkMode === networkModes.local
            ? ["31312:31312"]
            : ["127.0.0.1:31312:31312"]),
        ],
        command: ["--daemon", "monerod:18089"],
        labels: isTraefik
          ? {
              "traefik.enable": "true",
              "traefik.http.routers.moneroblock.rule": `Host(\`${moneroBlockDomain}\`)`,
              "traefik.http.routers.moneroblock.entrypoints": "websecure",
              "traefik.http.routers.moneroblock.tls.certresolver":
                "monerosuite",
              "traefik.http.services.moneroblock.loadbalancer.server.port":
                "31312",
            }
          : undefined,
        logging: !isMoneroblockLogging
          ? {
              driver: "none",
            }
          : undefined,
      },
    },
  });

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
