import { useQueryState, parseAsBoolean } from "nuqs";
import { Service, architectures, networkModes, NetworkMode } from "./types";

export const useMoneroWalletRpcService = () => {
  const [isMoneroWalletRpc, setIsMoneroWalletRpc] = useQueryState(
    "isMoneroWalletRpc",
    parseAsBoolean.withDefault(false)
  );

  const getMoneroWalletRpcService = (networkMode: NetworkMode): Service => ({
    name: "Monero Wallet RPC",
    description:
      "Monero Wallet RPC is a remote procedure call interface for Monero wallet.",
    checked: isMoneroWalletRpc,
    required: false,
    architecture: [architectures.linuxAmd, architectures.linuxArm],
    code: {
      "monero-wallet-rpc": {
        image: "sethsimmons/simple-monero-wallet-rpc:latest",
        restart: "unless-stopped",
        container_name: "monero-wallet-rpc",
        ports: [
          ...(networkMode === networkModes.local
            ? ["18083:18083"]
            : ["127.0.0.1:18083:18083"]),
        ],
        volumes: ["monero-wallet-rpc-data:/home/monero"],
        command: [
          "--daemon-address=monerod:18089",
          "--trusted-daemon",
          "--rpc-bind-port=18083",
          "--wallet-dir /home/monero",
        ],
      },
    },
    volumes: {
      "monero-wallet-rpc-data": {},
    },
  });

  return {
    getMoneroWalletRpcService,
    stateFunctions: {
      isMoneroWalletRpc,
      setIsMoneroWalletRpc,
    },
  };
};
