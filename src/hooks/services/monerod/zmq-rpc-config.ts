import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

export const useZmqRpcConfig = () => {
  const [zmqPubEnabled, setZmqPubEnabled] = useQueryState(
    "zmqPubEnabled",
    parseAsBoolean.withDefault(false)
  );

  const [zmqPubBindPort, setZmqPubBindPort] = useQueryState(
    "zmqPubBindPort",
    parseAsString.withDefault("18083")
  );

  const [rpcLogin, setRpcLogin] = useQueryState(
    "rpcLogin",
    parseAsString.withDefault("")
  );
  
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
