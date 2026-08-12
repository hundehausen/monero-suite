import { useQueryState, parseAsStringEnum, parseAsInteger } from "nuqs";
import { Service, minigModes, MiningMode, TorProxyMode, torProxyModes, P2PoolMode, p2poolModes } from "./types";
import { createXmrigService } from "@/lib/service-generators/xmrig";

export const useXmrigService = () => {
  const [miningMode, setMiningMode] = useQueryState<MiningMode>(
    "miningMode",
    parseAsStringEnum(Object.values(minigModes)).withDefault(minigModes.none)
  );
  const [xmrigDonateLevel, setXmrigDonateLevel] = useQueryState(
    "xmrigDonateLevel",
    parseAsInteger.withDefault(1)
  );

  const getXmrigService = (
    torProxyMode: TorProxyMode = torProxyModes.none,
    p2PoolMode: P2PoolMode = p2poolModes.full,
    isXmrigProxy = false
  ): Service => createXmrigService(miningMode, xmrigDonateLevel, torProxyMode, p2PoolMode, isXmrigProxy);

  return {
    getXmrigService,
    stateFunctions: {
      miningMode,
      setMiningMode,
      xmrigDonateLevel,
      setXmrigDonateLevel,
    },
  };
};
