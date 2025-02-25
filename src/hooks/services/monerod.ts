import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { useMemo } from "react";
import {
  Service,
  architectures,
  networkModes,
  p2poolModes,
  torProxyModes,
  NetworkMode,
} from "./types";

export const useMonerodService = () => {
  const [isMoneroPublicNode, setIsMoneroPublicNode] = useQueryState(
    "isMoneroPublicNode",
    parseAsBoolean.withDefault(true)
  );
  const [moneroNodeNoLogs, setMoneroNodeNoLogs] = useQueryState(
    "moneroNodeNoLogs",
    parseAsBoolean.withDefault(false)
  );
  const [moneroNodeDomain, setMoneroNodeDomain] = useQueryState(
    "moneroNodeDomain",
    parseAsString.withDefault("node.monerosuite.org")
  );
  const [isPrunedNode, setIsPrunedNode] = useQueryState(
    "isPrunedNode",
    parseAsBoolean.withDefault(false)
  );
  const [isSyncPrunedBlocks, setIsSyncPrunedBlocks] = useQueryState(
    "isSyncPrunedBlocks",
    parseAsBoolean.withDefault(false)
  );
  const [isMoneroMainnetVolume, setIsMoneroMainnetVolume] = useQueryState(
    "isMoneroMainnetVolume",
    parseAsBoolean.withDefault(true)
  );
  const [moneroMainnetBlockchainLocation, setMoneroMainnetBlockchainLocation] =
    useQueryState(
      "moneroMainnetBlockchainLocation",
      parseAsString.withDefault("~/.bitmonero")
    );

  const getMonerodService = (
    networkMode: NetworkMode,
    p2PoolMode: string,
    torProxyMode: string,
    isMonitoring: boolean,
    isHiddenServices: boolean,
    isTraefik: boolean,
    certResolverName: string = "monerosuite"
  ): Service => ({
    name: "Monero Node",
    description:
      "The Monero daemon, monerod, is the core software that runs the Monero network. It is responsible for storing the blockchain and synchronizing transactions.",
    checked: true,
    required: true,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    ufw:
      isMoneroPublicNode && networkMode === networkModes.exposed
        ? ["18080/tcp", "18089/tcp"]
        : undefined,
    volumes: isMoneroMainnetVolume
      ? {
          bitmonero: {},
        }
      : undefined,
    code: {
      monerod: {
        image: "ghcr.io/sethforprivacy/simple-monerod:latest",
        restart: "unless-stopped",
        container_name: "monerod",
        volumes: [
          ...(isMoneroMainnetVolume
            ? ["bitmonero:/home/monero/.bitmonero"]
            : [`${moneroMainnetBlockchainLocation}:/home/monero/.bitmonero`]),
        ],
        ports: [
          ...(isMoneroPublicNode || networkMode === networkModes.local
            ? ["18080:18080"]
            : ["127.0.0.1:18080:18080"]),
          ...(p2PoolMode !== p2poolModes.none
            ? isMoneroPublicNode || networkMode === networkModes.local
              ? ["18084:18084"]
              : ["127.0.0.1:18084:18084"]
            : []),
          ...(isMoneroPublicNode || networkMode === networkModes.local
            ? ["18089:18089"]
            : ["127.0.0.1:18089:18089"]),
        ],
        depends_on:
          torProxyMode !== "none"
            ? {
                "tor-proxy": {
                  condition: "service_started",
                },
              }
            : undefined,
        healthcheck: {
          test: "curl --fail http://localhost:18081/get_height || exit 1",
          interval: "60s",
          timeout: "5s",
          retries: 10,
          start_period: "40s",
        },
        command: [
          "--rpc-restricted-bind-ip=0.0.0.0",
          "--rpc-restricted-bind-port=18089",
          "--rpc-bind-ip=0.0.0.0",
          "--rpc-bind-port=18081",
          "--confirm-external-bind",
          "--enable-dns-blocklist",
          "--check-updates=disabled",
          ...(moneroNodeNoLogs
            ? ["--log-file=/dev/null", "--max-log-file-size=0"]
            : ["--max-log-files=3", "--max-log-file-size=1048576"]),
          "--no-igd",
          "--out-peers=64",
          "--limit-rate-down=1048576",
          ...(isPrunedNode ? ["--prune-blockchain"] : []),
          ...(isSyncPrunedBlocks ? ["--sync-pruned-blocks"] : []),
          ...(isMoneroPublicNode ? ["--public-node"] : []),
          ...(p2PoolMode !== p2poolModes.none || isMonitoring
            ? ["--zmq-pub=tcp://0.0.0.0:18084"]
            : ["--no-zmq"]),
          ...(isHiddenServices ? ["--disable-rpc-ban"] : []),
          ...(isHiddenServices && !isMoneroPublicNode
            ? ["--rpc-ssl=disabled"]
            : []),
          ...(torProxyMode === torProxyModes.full
            ? ["--proxy=127.0.0.1:9150"]
            : torProxyMode === torProxyModes.txonly
            ? ["--tx-proxy=tor,127.0.0.1:9150,32"]
            : []),
          ...(torProxyMode !== torProxyModes.none
            ? [
                "--add-priority-node=xwvz3ekocr3dkyxfkmgm2hvbpzx2ysqmaxgter7znnqrhoicygkfswid.onion:18083",
                "--add-priority-node=4pixvbejrvihnkxmduo2agsnmc3rrulrqc7s3cbwwrep6h6hrzsibeqd.onion:18083",
                "--add-priority-node=zbjkbsxc5munw3qusl7j2hpcmikhqocdf4pqhnhtpzw5nt5jrmofptid.onion:18083",
                "--add-priority-node=plowsof3t5hogddwabaeiyrno25efmzfxyro2vligremt7sxpsclfaid.onion:18083",
                "--add-priority-node=plowsoffjexmxalw73tkjmf422gq6575fc7vicuu4javzn2ynnte6tyd.onion:18083",
                "--add-priority-node=qz43zul2x56jexzoqgkx2trzwcfnr6l3hbtfcfx54g4r3eahy3bssjyd.onion:18083",
                "--add-peer=xwvz3ekocr3dkyxfkmgm2hvbpzx2ysqmaxgter7znnqrhoicygkfswid.onion:18083",
                "--add-peer=4pixvbejrvihnkxmduo2agsnmc3rrulrqc7s3cbwwrep6h6hrzsibeqd.onion:18083",
                "--add-peer=zbjkbsxc5munw3qusl7j2hpcmikhqocdf4pqhnhtpzw5nt5jrmofptid.onion:18083",
                "--add-peer=plowsof3t5hogddwabaeiyrno25efmzfxyro2vligremt7sxpsclfaid.onion:18083",
                "--add-peer=plowsoffjexmxalw73tkjmf422gq6575fc7vicuu4javzn2ynnte6tyd.onion:18083",
                "--add-peer=qz43zul2x56jexzoqgkx2trzwcfnr6l3hbtfcfx54g4r3eahy3bssjyd.onion:18083",
              ]
            : []),
        ],
        logging: moneroNodeNoLogs ? { driver: "none" } : undefined,
        labels: isTraefik
          ? {
              "traefik.enable": "true",
              "traefik.http.routers.monerod.rule": `Host(\`${moneroNodeDomain}\`)`,
              "traefik.http.routers.monerod.entrypoints": "websecure",
              "traefik.http.routers.monerod.tls.certresolver": certResolverName,
              "traefik.http.services.monerod.loadbalancer.server.port": "18089",
            }
          : undefined,
      },
    },
  });

  return {
    getMonerodService,
    stateFunctions: {
      isMoneroPublicNode,
      setIsMoneroPublicNode,
      moneroNodeNoLogs,
      setMoneroNodeNoLogs,
      moneroNodeDomain,
      setMoneroNodeDomain,
      isPrunedNode,
      setIsPrunedNode,
      isSyncPrunedBlocks,
      setIsSyncPrunedBlocks,
      isMoneroMainnetVolume,
      setIsMoneroMainnetVolume,
      moneroMainnetBlockchainLocation,
      setMoneroMainnetBlockchainLocation,
    },
  };
};
