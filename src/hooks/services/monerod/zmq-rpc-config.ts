import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { useSecretState } from "@/hooks/use-secret-state";

export const useZmqRpcConfig = () => {
  const [zmqPubEnabled, setZmqPubEnabled] = useQueryState(
    "zmqPubEnabled",
    parseAsBoolean.withDefault(false)
  );

  const [zmqPubBindPort, setZmqPubBindPort] = useQueryState(
    "zmqPubBindPort",
    parseAsString.withDefault("18083")
  );

  const [rpcLogin, setRpcLogin] = useSecretState("rpcLogin", "");
  
  const [disableRpcBan, setDisableRpcBan] = useQueryState(
    "disableRpcBan",
    parseAsBoolean.withDefault(false)
  );

  return {
    zmqPubEnabled,
    setZmqPubEnabled,
    zmqPubBindPort,
    setZmqPubBindPort,
    rpcLogin,
    setRpcLogin,
    disableRpcBan,
    setDisableRpcBan,
  };
};
