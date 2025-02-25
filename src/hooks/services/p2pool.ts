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
  NetworkMode,
} from "./types";

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

  const getP2PoolService = (
    networkMode: NetworkMode,
    miningMode: MiningMode,
    torProxyMode: string
  ): Service => ({
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
      p2PoolMode === p2poolModes.mini && networkMode === networkModes.exposed
        ? ["37888/tcp", "3333/tcp"]
        : p2PoolMode === p2poolModes.full &&
          networkMode === networkModes.exposed
        ? ["37889/tcp", "3333/tcp"]
        : undefined,
    code: {
      p2pool: {
        image: "ghcr.io/sethforprivacy/p2pool:latest",
        restart: "unless-stopped",
        container_name: "p2pool",
        tty: true,
        stdin_open: true,
        volumes: [
          "p2pool-data:/home/p2pool",
          "/dev/hugepages:/dev/hugepages:rw",
        ],
        ports: [
          "3333:3333",
          ...(p2PoolMode === p2poolModes.mini ? ["37888:37888"] : []),
          ...(p2PoolMode === p2poolModes.full ? ["37889:37889"] : []),
        ],
        command: [
          `--wallet ${p2PoolPayoutAddress}`,
          "--stratum 0.0.0.0:3333",
          `--p2p 0.0.0.0:${
            p2PoolMode === p2poolModes.mini ? "37888" : "37889"
          }`,
          "--rpc-port 18089",
          "--zmq-port 18084",
          "--host monerod",
          ...(miningMode === minigModes.p2pool
            ? [`--start-mining ${p2PoolMiningThreads}`]
            : []),
          ...(torProxyMode === torProxyModes.full
            ? ["--socks5 127.0.0.1:9150"]
            : []),
        ].join(" "),
      },
    },
  });

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
