import {
  useQueryState,
  parseAsString,
  parseAsStringEnum,
  parseAsInteger,
} from "nuqs";
import {
  Service,
  architectures,
  networkModes,
  p2poolModes,
  P2PoolMode,
  minigModes,
  MiningMode,
  torProxyModes,
  TorProxyMode,
  NetworkMode,
} from "./types";
import { P2POOL_IP, MONEROD_IP } from "./tor";
import { safeParse, moneroAddressSchema } from "@/lib/schemas";
import { DOCKER_IMAGES, P2POOL_PORTS, MONEROD_PORTS } from "@/lib/constants";
import { getTorNetworkConfig } from "@/lib/docker-helpers";

export const useP2PoolService = () => {
  const [p2PoolMode, setP2PoolMode] = useQueryState<P2PoolMode>(
    "p2PoolMode",
    parseAsStringEnum(Object.values(p2poolModes)).withDefault(p2poolModes.none)
  );
  const [p2PoolPayoutAddress, setP2PoolPayoutAddress] = useQueryState(
    "p2PoolPayoutAddress",
    parseAsString.withDefault(
      "48oc8c65B9JPv6FBZBg7UN9xUYmxux6WfEh61WBoKca7Amh7r7bnCZ7JJicLw7UN3DEgEADwqrhwxGBJazPZ14PJGbmMyXX"
    )
  );
  const [p2PoolMiningThreads, setP2PoolMiningThreads] = useQueryState(
    "p2PoolMiningThreads",
    parseAsInteger.withDefault(4)
  );

  const p2PoolContainerName = p2PoolMode === p2poolModes.mini
    ? "p2pool-mini"
    : p2PoolMode === p2poolModes.nano
      ? "p2pool-nano"
      : "p2pool"

  const getP2PoolService = (
    networkMode: NetworkMode,
    miningMode: MiningMode,
    torProxyMode: TorProxyMode
  ): Service => {
    const sPayoutAddress = safeParse(moneroAddressSchema, p2PoolPayoutAddress, "");
    return ({
    name: "P2Pool",
    description:
      "P2Pool is a decentralized mining pool that works by creating a peer-to-peer network of miner nodes. For Monero's decentralization, it is better to use P2Pool instead of a centralized mining pool.",
    checked: p2PoolMode,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    volumes: {
      "p2pool-data": {},
    },
    ufw:
      networkMode === networkModes.exposed
        ? p2PoolMode === p2poolModes.mini
          ? [`${P2POOL_PORTS.p2pMini}/tcp`, `${P2POOL_PORTS.stratum}/tcp`]
          : p2PoolMode === p2poolModes.full
            ? [`${P2POOL_PORTS.p2pFull}/tcp`, `${P2POOL_PORTS.stratum}/tcp`]
            : p2PoolMode === p2poolModes.nano
              ? [`${P2POOL_PORTS.p2pNano}/tcp`, `${P2POOL_PORTS.stratum}/tcp`]
              : undefined
        : undefined,
    code: {
      [p2PoolContainerName]: {
        image: DOCKER_IMAGES.p2pool,
        restart: "unless-stopped",
        container_name: p2PoolContainerName,
        tty: true,
        stdin_open: true,
        volumes: [
          "p2pool-data:/home/p2pool",
          "/dev/null:/home/p2pool/.p2pool/p2pool.log:rw",
          "/dev/hugepages:/dev/hugepages:rw",
        ],
        ports: [
          `${P2POOL_PORTS.stratum}:${P2POOL_PORTS.stratum}`,
          ...(p2PoolMode === p2poolModes.mini ? [`${P2POOL_PORTS.p2pMini}:${P2POOL_PORTS.p2pMini}`] : []),
          ...(p2PoolMode === p2poolModes.full ? [`${P2POOL_PORTS.p2pFull}:${P2POOL_PORTS.p2pFull}`] : []),
          ...(p2PoolMode === p2poolModes.nano ? [`${P2POOL_PORTS.p2pNano}:${P2POOL_PORTS.p2pNano}`] : []),
        ],
        ...getTorNetworkConfig(torProxyMode, P2POOL_IP, [p2PoolContainerName]),
        depends_on: {
          monerod: {
            condition: "service_started",
          },
        },
        command: [
          `--wallet ${sPayoutAddress}`,
          `--stratum 0.0.0.0:${P2POOL_PORTS.stratum}`,
          `--p2p 0.0.0.0:${p2PoolMode === p2poolModes.mini ? P2POOL_PORTS.p2pMini : p2PoolMode === p2poolModes.nano ? P2POOL_PORTS.p2pNano : P2POOL_PORTS.p2pFull}`,
          `--rpc-port ${MONEROD_PORTS.rpcRestricted}`,
          `--zmq-port ${MONEROD_PORTS.zmqPub}`,
          ...(torProxyMode !== torProxyModes.none
            ? [`--host ${MONEROD_IP}`, "--no-dns"]
            : ["--host monerod"]),
          ...(miningMode === minigModes.p2pool
            ? [`--start-mining ${p2PoolMiningThreads}`]
            : []),
          // ...(torProxyMode === torProxyModes.full ? ["--socks5 tor:9050"] : []),
          ...(p2PoolMode === p2poolModes.mini ? ["--mini"] : []),
          ...(p2PoolMode === p2poolModes.nano ? ["--nano"] : [])
        ].join(" "),
      },
    },
  });
  };

  return {
    getP2PoolService,
    stateFunctions: {
      p2PoolMode,
      setP2PoolMode,
      p2PoolPayoutAddress,
      setP2PoolPayoutAddress,
      p2PoolMiningThreads,
      setP2PoolMiningThreads,
    },
  };
};
