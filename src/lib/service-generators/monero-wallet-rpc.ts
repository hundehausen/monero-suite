import { Service, architectures } from "@/lib/service-types";
import { DOCKER_IMAGES, SERVICE_PORTS, MONEROD_PORTS } from "@/lib/constants";
import { getPortBinding, getTorClientNetworkConfig } from "@/lib/docker-helpers";
import type { FullConfig } from "@/lib/config-schema";

export const createMoneroWalletRpcService = (
  config: FullConfig
): Service => ({
  name: "Monero Wallet RPC",
  description:
    "Connect external wallets and applications to your node via the Wallet RPC interface. Required for some wallet apps and payment processors.",
  checked: config.services.isMoneroWalletRpc,
  required: false,
  architecture: [architectures.linuxAmd, architectures.linuxArm],
  env: {
    WALLET_RPC_USER: "monero",
    WALLET_RPC_PASSWORD: "changeme",
  },
  code: {
    "monero-wallet-rpc": {
      image: DOCKER_IMAGES.moneroWalletRpc,
      restart: "unless-stopped",
      container_name: "monero-wallet-rpc",
      ports: [getPortBinding(config.networkMode, SERVICE_PORTS.moneroWalletRpc)],
      volumes: ["monero-wallet-rpc-data:/home/monero"],
      ...getTorClientNetworkConfig(config.tor.torProxyMode),
      command: [
        `--daemon-address=monerod:${MONEROD_PORTS.rpcRestricted}`,
        "--trusted-daemon",
        `--rpc-bind-port=${SERVICE_PORTS.moneroWalletRpc}`,
        "--rpc-login=${WALLET_RPC_USER}:${WALLET_RPC_PASSWORD}",
        "--wallet-dir=/home/monero/wallet",
      ],
    },
  },
  volumes: {
    "monero-wallet-rpc-data": {},
  },
});
