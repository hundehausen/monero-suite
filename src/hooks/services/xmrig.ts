import { useQueryState, parseAsStringEnum, parseAsInteger } from "nuqs";
import { minigModes, MiningMode } from "./types";

export const useXmrigService = () => {
  const [miningMode, setMiningMode] = useQueryState<MiningMode>(
    "miningMode",
    parseAsStringEnum(Object.values(minigModes)).withDefault(minigModes.none)
  );
  const [xmrigDonateLevel, setXmrigDonateLevel] = useQueryState(
    "xmrigDonateLevel",
    parseAsInteger.withDefault(1)
  );

  return {
    stateFunctions: {
      miningMode,
      setMiningMode,
      xmrigDonateLevel,
      setXmrigDonateLevel,
    },
  };
};
