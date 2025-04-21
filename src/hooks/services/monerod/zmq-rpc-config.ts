import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon ZMQ and RPC configuration settings
 */
export const useZmqRpcConfig = () => {
  const [zmqPubEnabled, setZmqPubEnabled] = useQueryState(
    "zmqPubEnabled", 
    parseAsBoolean.withDefault(false)
  );
  
  const [zmqPubBindPort, setZmqPubBindPort] = useQueryState(
    "zmqPubBindPort", 
    parseAsString.withDefault("18084")
  );

  const [rpcSsl, setRpcSsl] = useQueryState(
    "rpcSsl", 
    parseAsString.withDefault("autodetect")
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
    rpcSsl,
    setRpcSsl,
    rpcLogin,
    setRpcLogin,
    disableRpcBan,
    setDisableRpcBan,
  };
};
