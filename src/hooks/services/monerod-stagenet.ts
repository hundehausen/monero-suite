import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { Service, architectures, networkModes, NetworkMode } from "./types";

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
    isTraefik: boolean
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
            ? ["bitmonero-stagenet:/home/monero"]
            : [`${moneroStagenetBlockchainLocation}:/home/monero/.bitmonero`]),
        ],
        ports: [
          ...(isStagenetNodePublic || networkMode === networkModes.local
            ? ["38080:38080"]
            : ["127.0.0.1:38080:38080"]),
          ...(isStagenetNodePublic || networkMode === networkModes.local
            ? ["38089:38089"]
            : ["127.0.0.1:38089:38089"]),
        ],
        command: [
          "--rpc-restricted-bind-ip=0.0.0.0",
          "--rpc-restricted-bind-port=38089",
          "--rpc-bind-ip=0.0.0.0",
          "--rpc-bind-port=38081",
          "--confirm-external-bind",
          "--enable-dns-blocklist",
          "--check-updates=disabled",
          "--no-igd",
          ...(moneroNodeNoLogs
            ? ["--log-file=/dev/null"]
            : ["--max-log-files=3", "--max-log-file-size=1048576"]),
          "--out-peers=32",
          "--limit-rate-down=1048576",
          ...(isStagenetNodePublic ? ["--public-node"] : []),
          "--stagenet",
        ],
        logging: !moneroNodeNoLogs ? undefined : { driver: "none" },
        healthcheck: {
          test: [
            "CMD-SHELL",
            "curl --fail http://localhost:38081/get_info || exit 1",
          ],
          interval: "30s",
          timeout: "5s",
          retries: 3,
        },
        labels: isTraefik
          ? {
              "traefik.enable": "true",
              "traefik.http.routers.monerod-stagenet.rule": `Host(\`${stagenetNodeDomain}\`)`,
              "traefik.http.routers.monerod-stagenet.entrypoints": "websecure",
              "traefik.http.routers.monerod-stagenet.tls.certresolver":
                "monerosuite",
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
