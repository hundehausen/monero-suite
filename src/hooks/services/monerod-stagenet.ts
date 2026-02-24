import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode, torProxyModes, TorProxyMode } from "./types";
import { TOR_IP, MONEROD_STAGENET_IP } from "./tor";
import { safeParse, pathSchema } from "@/lib/schemas";
import { DOCKER_IMAGES } from "@/lib/constants";
import { getTraefikConfig, getPortBinding, getTorNetworkConfig } from "@/lib/docker-helpers";

export const useMonerodStagenetService = () => {
  const [isStagenetNode, setIsStagenetNode] = useQueryState(
    "isStagenetNode",
    parseAsBoolean.withDefault(false)
  );
  const [isStagenetNodePublic, setIsStagenetNodePublic] = useQueryState(
    "isStagenetNodePublic",
    parseAsBoolean.withDefault(true)
  );
  const [isMoneroStagenetCustomLocation, setIsMoneroStagenetCustomLocation] = useQueryState(
    "isMoneroStagenetCustomLocation",
    parseAsBoolean.withDefault(false)
  );
  const [
    moneroStagenetBlockchainLocation,
    setMoneroStagenetBlockchainLocation,
  ] = useQueryState(
    "moneroStagenetBlockchainLocation",
    parseAsString.withDefault("~/.bitmonero")
  );
  const [stagenetNodeDomain, setStagenetNodeDomain] = useQueryState(
    "stagenetNodeDomain",
    parseAsString.withDefault("stagenet.example.com")
  );
  const [moneroNodeNoLogs, setMoneroNodeNoLogs] = useQueryState(
    "moneroNodeNoLogs",
    parseAsBoolean.withDefault(false)
  );

  const getMonerodStagenetService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service => {
    const { labels } = getTraefikConfig(isTraefik, "monerod-stagenet", stagenetNodeDomain, "18089", certResolverName);
    const sPath = safeParse(pathSchema, moneroStagenetBlockchainLocation, "~/.bitmonero");
    return ({
    name: "Monero Stagenet Node",
    description:
      "Run a node on Monero's test network (stagenet). Perfect for developers testing integrations or users learning how Monero works without using real funds.",
    checked: isStagenetNode,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    ufw:
      isStagenetNodePublic && networkMode === networkModes.exposed
        ? ["38080/tcp", "38089/tcp"]
        : undefined,
    volumes: !isMoneroStagenetCustomLocation
      ? {
          "bitmonero-stagenet": {},
        }
      : undefined,
    code: {
      "monerod-stagenet": {
        image: DOCKER_IMAGES.monerod,
        restart: "unless-stopped",
        container_name: "monerod-stagenet",
        volumes: [
          ...(!isMoneroStagenetCustomLocation
            ? ["bitmonero-stagenet:/home/monero/.bitmonero"]
            : [
                `${sPath}:/home/monero/.bitmonero`,
              ]),
        ],
        ports: [
          getPortBinding(isStagenetNodePublic ? networkModes.local : networkMode, 38080),
          getPortBinding(isStagenetNodePublic ? networkModes.local : networkMode, 38081),
          getPortBinding(isStagenetNodePublic ? networkModes.local : networkMode, 38089),
        ],
        depends_on:
          torProxyMode !== torProxyModes.none
            ? {
                tor: {
                  condition: "service_healthy",
                },
              }
            : undefined,
        ...getTorNetworkConfig(torProxyMode, MONEROD_STAGENET_IP),
        command: [
          "--stagenet",
          "--rpc-restricted-bind-ip=0.0.0.0",
          "--rpc-restricted-bind-port=38089",
          "--rpc-bind-ip=0.0.0.0",
          "--rpc-bind-port=38081",
          "--confirm-external-bind",
          "--enable-dns-blocklist",
          "--check-updates=disabled",
          ...(moneroNodeNoLogs
            ? ["--log-file=/dev/null", "--max-log-file-size=0"]
            : ["--max-log-files=3", "--max-log-file-size=1048576"]),
          "--no-igd",
          "--out-peers=64",
          "--limit-rate-down=1048576",
          ...(isStagenetNodePublic ? ["--public-node"] : []),
          ...(torProxyMode === torProxyModes.full
            ? [`--proxy=${TOR_IP}:9050`]
            : []),
          ...(torProxyMode !== torProxyModes.none
            ? [`--tx-proxy=tor,${TOR_IP}:9050,32`]
            : []),
        ],
        logging: moneroNodeNoLogs ? { driver: "none" } : undefined,
        labels,
      },
    },
  });
  };

  return {
    getMonerodStagenetService,
    stateFunctions: {
      isStagenetNode,
      setIsStagenetNode,
      isStagenetNodePublic,
      setIsStagenetNodePublic,
      isMoneroStagenetCustomLocation,
      setIsMoneroStagenetCustomLocation,
      moneroStagenetBlockchainLocation,
      setMoneroStagenetBlockchainLocation,
      stagenetNodeDomain,
      setStagenetNodeDomain,
    },
  };
};
