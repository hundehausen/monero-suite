import { useQueryState, parseAsBoolean, parseAsString, parseAsStringEnum } from "nuqs";

export const RPC_SSL_VALUES = ["autodetect", "enabled", "disabled"] as const;
export type RpcSslValue = (typeof RPC_SSL_VALUES)[number];

export const useZmqRpcConfig = () => {
  const [zmqPubEnabled, setZmqPubEnabled] = useQueryState(
    "zmqPubEnabled",
    parseAsBoolean.withDefault(false)
  );

  const [zmqPubBindPort, setZmqPubBindPort] = useQueryState(
    "zmqPubBindPort",
    parseAsString.withDefault("18083")
  );

  const [rpcSsl, setRpcSsl] = useQueryState(
    "rpcSsl",
    parseAsStringEnum<RpcSslValue>([...RPC_SSL_VALUES]).withDefault("autodetect")
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
