"use client";

import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";
import {
  networkModes,
  torProxyModes,
  TorProxyMode,
  NetworkMode,
} from "./types";
import { useEffect } from "react";
import { anyHiddenService } from "@/lib/service-generators/ctx";

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
  const [hsMoneroPay, setHsMoneroPay] = useQueryState("hsMoneroPay", parseAsBoolean.withDefault(false));
  const [hsXmrigProxy, setHsXmrigProxy] = useQueryState("hsXmrigProxy", parseAsBoolean.withDefault(false));

  const [isGlobalTorProxy, setIsGlobalTorProxy] = useQueryState(
    "isGlobalTorProxy",
    parseAsBoolean.withDefault(false)
  );

  const isHiddenServices = anyHiddenService({
    torProxyMode,
    hsMonerod,
    hsMonerodP2P,
    hsStagenet,
    hsP2Pool,
    hsGrafana,
    hsLws,
    hsMoneroPay,
    hsXmrigProxy,
    isGlobalTorProxy,
  });

  useEffect(() => {
    if (networkMode === networkModes.exposed) {
      setIsGlobalTorProxy(false);
    }
  }, [networkMode, setIsGlobalTorProxy]);

  return {
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
      hsMoneroPay,
      setHsMoneroPay,
      hsXmrigProxy,
      setHsXmrigProxy,
      isGlobalTorProxy,
      setIsGlobalTorProxy,
    },
  };
};
