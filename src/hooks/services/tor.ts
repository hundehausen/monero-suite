"use client";

import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";
import {
  Service,
  networkModes,
  torProxyModes,
  TorProxyMode,
  NetworkMode,
  p2poolModes,
  P2PoolMode,
} from "./types";
import { useEffect } from "react";

import { createTorService } from "@/lib/service-generators/tor";
export { TOR_IP, MONEROD_IP, MONEROD_STAGENET_IP, P2POOL_IP, GRAFANA_IP } from "@/lib/service-constants";

export const useTorService = ({ networkMode }: { networkMode: NetworkMode }) => {
  const [torProxyMode, setTorProxyMode] = useQueryState<TorProxyMode>(
    "torProxyMode",
    parseAsStringEnum(Object.values(torProxyModes)).withDefault(
      torProxyModes.none
    )
  );

  const [hsMonerod, setHsMonerod] = useQueryState("hsMonerod", parseAsBoolean.withDefault(false));
  const [hsMonerodP2P, setHsMonerodP2P] = useQueryState("hsMonerodP2P", parseAsBoolean.withDefault(false));
  const [hsStagenet, setHsStagenet] = useQueryState("hsStagenet", parseAsBoolean.withDefault(false));
  const [hsP2Pool, setHsP2Pool] = useQueryState("hsP2Pool", parseAsBoolean.withDefault(false));
  const [hsGrafana, setHsGrafana] = useQueryState("hsGrafana", parseAsBoolean.withDefault(false));
  const [hsLws, setHsLws] = useQueryState("hsLws", parseAsBoolean.withDefault(false));

  const isHiddenServices = hsMonerod || hsMonerodP2P || hsStagenet || hsP2Pool || hsGrafana || hsLws;

  const [isGlobalTorProxy, setIsGlobalTorProxy] = useQueryState(
    "isGlobalTorProxy",
    parseAsBoolean.withDefault(false)
  );

  useEffect(() => {
    if (networkMode === networkModes.exposed) {
      setIsGlobalTorProxy(false);
    }
  }, [networkMode, setIsGlobalTorProxy]);

  const getTorService = (
    networkMode: NetworkMode,
    isStagenetNode: boolean = false,
    p2PoolMode: P2PoolMode = p2poolModes.none,
    isMonitoring: boolean = false,
    isMoneroLws: boolean = false
  ): Service =>
    createTorService(
      { torProxyMode, hsMonerod, hsMonerodP2P, hsStagenet, hsP2Pool, hsGrafana, hsLws, isGlobalTorProxy },
      networkMode,
      isStagenetNode,
      p2PoolMode,
      isMonitoring,
      isMoneroLws
    );

  return {
    getTorService,
    stateFunctions: {
      torProxyMode,
      setTorProxyMode,
      isHiddenServices,
      hsMonerod,
      setHsMonerod,
      hsMonerodP2P,
      setHsMonerodP2P,
      hsStagenet,
      setHsStagenet,
      hsP2Pool,
      setHsP2Pool,
      hsGrafana,
      setHsGrafana,
      hsLws,
      setHsLws,
      isGlobalTorProxy,
      setIsGlobalTorProxy,
    },
  };
};
