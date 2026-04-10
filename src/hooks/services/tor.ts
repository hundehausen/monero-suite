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
export { TOR_IP, MONEROD_IP, MONEROD_STAGENET_IP, P2POOL_IP, MONEROBLOCK_IP, EXPLORER_IP, GRAFANA_IP } from "@/lib/service-constants";

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
  const [hsMoneroblock, setHsMoneroblock] = useQueryState("hsMoneroblock", parseAsBoolean.withDefault(false));
  const [hsOnionExplorer, setHsOnionExplorer] = useQueryState("hsOnionExplorer", parseAsBoolean.withDefault(false));
  const [hsGrafana, setHsGrafana] = useQueryState("hsGrafana", parseAsBoolean.withDefault(false));

  const isHiddenServices = hsMonerod || hsMonerodP2P || hsStagenet || hsP2Pool || hsMoneroblock || hsOnionExplorer || hsGrafana;

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
    isMoneroblock: boolean = false,
    isOnionMoneroBlockchainExplorer: boolean = false,
    isMonitoring: boolean = false
  ): Service =>
    createTorService(
      { torProxyMode, hsMonerod, hsMonerodP2P, hsStagenet, hsP2Pool, hsMoneroblock, hsOnionExplorer, hsGrafana, isGlobalTorProxy },
      networkMode,
      isStagenetNode,
      p2PoolMode,
      isMoneroblock,
      isOnionMoneroBlockchainExplorer,
      isMonitoring
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
      hsMoneroblock,
      setHsMoneroblock,
      hsOnionExplorer,
      setHsOnionExplorer,
      hsGrafana,
      setHsGrafana,
      isGlobalTorProxy,
      setIsGlobalTorProxy,
    },
  };
};
