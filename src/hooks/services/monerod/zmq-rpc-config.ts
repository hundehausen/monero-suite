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
  
  const [rpcRestricted, setRpcRestricted] = useQueryState(
    "rpcRestricted", 
    parseAsBoolean.withDefault(true)
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
    rpcRestricted,
    setRpcRestricted,
    rpcSsl,
    setRpcSsl,
    rpcLogin,
    setRpcLogin,
    disableRpcBan,
    setDisableRpcBan,
  };
};
