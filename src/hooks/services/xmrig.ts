import { useQueryState, parseAsStringEnum, parseAsInteger } from "nuqs";
import { Service, minigModes, MiningMode } from "./types";
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

  const getXmrigService = (): Service =>
    createXmrigService(miningMode, xmrigDonateLevel);

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
