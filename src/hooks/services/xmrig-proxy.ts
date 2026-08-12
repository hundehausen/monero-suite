import { useQueryState, parseAsBoolean } from "nuqs";
import {
  Service,
  NetworkMode,
  P2PoolMode,
  TorProxyMode,
  torProxyModes,
} from "./types";
import { createXmrigProxyService } from "@/lib/service-generators/xmrig-proxy";

export const useXmrigProxyService = () => {
  const [isXmrigProxy, setIsXmrigProxy] = useQueryState(
    "isXmrigProxy",
    parseAsBoolean.withDefault(false)
  );
  const [isXmrigProxyPublic, setIsXmrigProxyPublic] = useQueryState(
    "isXmrigProxyPublic",
    parseAsBoolean.withDefault(false)
  );

  const getXmrigProxyService = (
    p2PoolMode: P2PoolMode,
    networkMode: NetworkMode,
    torProxyMode: TorProxyMode = torProxyModes.none
  ): Service =>
    createXmrigProxyService(
      isXmrigProxy,
      p2PoolMode,
      networkMode,
      isXmrigProxyPublic,
      torProxyMode
    );

  return {
    getXmrigProxyService,
    stateFunctions: {
      isXmrigProxy,
      setIsXmrigProxy,
      isXmrigProxyPublic,
      setIsXmrigProxyPublic,
    },
  };
};
