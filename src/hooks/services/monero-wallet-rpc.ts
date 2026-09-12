import { useQueryState, parseAsBoolean } from "nuqs";
import { useSecretState } from "@/hooks/use-secret-state";
import {
  DEFAULT_WALLET_RPC_PASSWORD,
  DEFAULT_WALLET_RPC_USER,
} from "@/lib/constants";

export const useMoneroWalletRpcService = () => {
  const [isMoneroWalletRpc, setIsMoneroWalletRpc] = useQueryState(
    "isMoneroWalletRpc",
    parseAsBoolean.withDefault(false)
  );
  const [walletRpcUser, setWalletRpcUser] = useSecretState(
    "walletRpcUser",
    DEFAULT_WALLET_RPC_USER
  );
  const [walletRpcPassword, setWalletRpcPassword] = useSecretState(
    "walletRpcPassword",
    DEFAULT_WALLET_RPC_PASSWORD
  );

  return {
    stateFunctions: {
      isMoneroWalletRpc,
      setIsMoneroWalletRpc,
      walletRpcUser,
      setWalletRpcUser,
      walletRpcPassword,
      setWalletRpcPassword,
    },
  };
};
