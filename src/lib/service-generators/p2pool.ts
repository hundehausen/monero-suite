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
} from "@/hooks/services/types";
import { P2POOL_IP, MONEROD_IP } from "@/lib/service-constants";
import { safeParse, moneroAddressSchema } from "@/lib/schemas";
import { DOCKER_IMAGES, P2POOL_PORTS, MONEROD_PORTS } from "@/lib/constants";
import { getTorNetworkConfig } from "@/lib/docker-helpers";

interface P2PoolDataConfig {
  p2PoolMode: P2PoolMode;
  p2PoolPayoutAddress: string;
  p2PoolMiningThreads: number;
}

export function getP2PoolContainerName(p2PoolMode: P2PoolMode): string {
  if (p2PoolMode === p2poolModes.mini) return "p2pool-mini";
  if (p2PoolMode === p2poolModes.nano) return "p2pool-nano";
  return "p2pool";
}

export const createP2PoolService = (
  state: P2PoolDataConfig,
  miningMode: MiningMode,
  torProxyMode: TorProxyMode,
  networkMode: NetworkMode = networkModes.local,
  zmqPubPort: number
): Service => {
  const { p2PoolMode, p2PoolPayoutAddress, p2PoolMiningThreads } = state;
  const sPayoutAddress = safeParse(moneroAddressSchema, p2PoolPayoutAddress, "");
  const p2PoolContainerName = getP2PoolContainerName(p2PoolMode);
  const p2pPort =
    p2PoolMode === p2poolModes.mini
      ? P2POOL_PORTS.p2pMini
      : p2PoolMode === p2poolModes.nano
        ? P2POOL_PORTS.p2pNano
        : P2POOL_PORTS.p2pFull;

  return ({
    name: "P2Pool",
    description:
      "Mine Monero without trusting a centralized pool. P2Pool connects miners directly to each other, keeping the network decentralized. You keep full control of your mining rewards.",
    checked: p2PoolMode,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    volumes: {
      "p2pool-data": {},
    },
    ufw:
      networkMode === networkModes.exposed && p2PoolMode !== p2poolModes.none
        ? [`${p2pPort}/tcp`, `${P2POOL_PORTS.stratum}/tcp`]
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
          `${p2pPort}:${p2pPort}`,
        ],
        ...getTorNetworkConfig(torProxyMode, P2POOL_IP, [p2PoolContainerName]),
        depends_on: {
          monerod: {
            condition: "service_started",
          },
        },
        command: [
          "--wallet",
          sPayoutAddress,
          "--stratum",
          `0.0.0.0:${P2POOL_PORTS.stratum}`,
          "--p2p",
          `0.0.0.0:${p2pPort}`,
          "--rpc-port",
          `${MONEROD_PORTS.rpcRestricted}`,
          "--zmq-port",
          `${zmqPubPort}`,
          ...(torProxyMode !== torProxyModes.none
            ? ["--host", `${MONEROD_IP}`, "--no-dns"]
            : ["--host", "monerod"]),
          ...(miningMode === minigModes.p2pool
            ? ["--start-mining", `${p2PoolMiningThreads}`]
            : []),
          ...(p2PoolMode === p2poolModes.mini ? ["--mini"] : []),
          ...(p2PoolMode === p2poolModes.nano ? ["--nano"] : []),
        ],
      },
    },
  });
};
