import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode, torProxyModes } from "./types";
import { TOR_IP, MONEROD_STAGENET_IP } from "./tor";

export const useMonerodStagenetService = () => {
  const [isStagenetNode, setIsStagenetNode] = useQueryState(
    "isStagenetNode",
    parseAsBoolean.withDefault(false)
  );
  const [isStagenetNodePublic, setIsStagenetNodePublic] = useQueryState(
    "isStagenetNodePublic",
    parseAsBoolean.withDefault(true)
  );
  const [isMoneroStagenetVolume, setIsMoneroStagenetVolume] = useQueryState(
    "isMoneroStagenetVolume",
    parseAsBoolean.withDefault(true)
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
    parseAsString.withDefault("stagenet.monerosuite.org")
  );
  const [moneroNodeNoLogs, setMoneroNodeNoLogs] = useQueryState(
    "moneroNodeNoLogs",
    parseAsBoolean.withDefault(false)
  );

  const getMonerodStagenetService = (
    networkMode: NetworkMode,
    isTraefik: boolean,
    certResolverName: string = "monerosuite",
    torProxyMode: string = torProxyModes.none
  ): Service => ({
    name: "Monero Stagenet Node",
    description:
      "Run a monerod stagenet node. Stagenet is a testing network for developers. It is a separate blockchain with separate coins from the main Monero network.",
    checked: isStagenetNode,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    ufw:
      isStagenetNodePublic && networkMode === networkModes.exposed
        ? ["38080/tcp", "38089/tcp"]
        : undefined,
    volumes: isMoneroStagenetVolume
      ? {
          "bitmonero-stagenet": {},
        }
      : undefined,
    code: {
      "monerod-stagenet": {
        image: "ghcr.io/sethforprivacy/simple-monerod:latest",
        restart: "unless-stopped",
        container_name: "monerod-stagenet",
        volumes: [
          ...(isMoneroStagenetVolume
            ? ["bitmonero-stagenet:/home/monero/.bitmonero"]
            : [
                `${moneroStagenetBlockchainLocation}:/home/monero/.bitmonero`,
              ]),
        ],
        ports: [
          ...(isStagenetNodePublic || networkMode === networkModes.local
            ? ["38080:38080"]
            : ["127.0.0.1:38080:38080"]),
          ...(isStagenetNodePublic || networkMode === networkModes.local
            ? ["38081:38081"]
            : ["127.0.0.1:38081:38081"]),
          ...(isStagenetNodePublic || networkMode === networkModes.local
            ? ["38089:38089"]
            : ["127.0.0.1:38089:38089"]),
        ],
        depends_on:
          torProxyMode !== torProxyModes.none
            ? {
                tor: {
                  condition: "service_healthy",
                },
              }
            : undefined,
        // Add network configuration if Tor proxy is enabled
        ...(torProxyMode !== torProxyModes.none
          ? {
              networks: {
                monero_suite_net: {
                  ipv4_address: MONEROD_STAGENET_IP
                }
              }
            }
          : {}),
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
            : torProxyMode === torProxyModes.txonly
            ? [`--tx-proxy=tor,${TOR_IP}:9050,32`]
            : []),
        ],
        logging: moneroNodeNoLogs ? { driver: "none" } : undefined,
        labels: isTraefik
          ? {
              "traefik.enable": "true",
              "traefik.http.routers.monerod-stagenet.rule": `Host(\`${stagenetNodeDomain}\`)`,
              "traefik.http.routers.monerod-stagenet.entrypoints": "websecure",
              "traefik.http.routers.monerod-stagenet.tls.certresolver":
                certResolverName,
              "traefik.http.services.monerod-stagenet.loadbalancer.server.port":
                "18089",
            }
          : undefined,
      },
    },
  });

  return {
    getMonerodStagenetService,
    stateFunctions: {
      isStagenetNode,
      setIsStagenetNode,
      isStagenetNodePublic,
      setIsStagenetNodePublic,
      isMoneroStagenetVolume,
      setIsMoneroStagenetVolume,
      moneroStagenetBlockchainLocation,
      setMoneroStagenetBlockchainLocation,
      stagenetNodeDomain,
      setStagenetNodeDomain,
    },
  };
};
