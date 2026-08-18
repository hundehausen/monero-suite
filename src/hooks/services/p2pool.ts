import {
  useQueryState,
  parseAsString,
  parseAsStringEnum,
  parseAsInteger,
  parseAsBoolean,
} from "nuqs";
import {
  p2poolModes,
  P2PoolMode,
} from "./types";

export const useP2PoolService = () => {
  const [p2PoolMode, setP2PoolMode] = useQueryState<P2PoolMode>(
    "p2PoolMode",
    parseAsStringEnum(Object.values(p2poolModes)).withDefault(p2poolModes.none)
  );
  const [p2PoolPayoutAddress, setP2PoolPayoutAddress] = useQueryState(
    "p2PoolPayoutAddress",
    parseAsString.withDefault(
      "48oc8c65B9JPv6FBZBg7UN9xUYmxux6WfEh61WBoKca7Amh7r7bnCZ7JJicLw7UN3DEgEADwqrhwxGBJazPZ14PJGbmMyXX"
    )
  );
  const [p2PoolMiningThreads, setP2PoolMiningThreads] = useQueryState(
    "p2PoolMiningThreads",
    parseAsInteger.withDefault(4)
  );
  const [isP2PoolStratumPublic, setIsP2PoolStratumPublic] = useQueryState(
    "isP2PoolStratumPublic",
    parseAsBoolean.withDefault(false)
  );

  return {
    stateFunctions: {
      p2PoolMode,
      setP2PoolMode,
      p2PoolPayoutAddress,
      setP2PoolPayoutAddress,
      p2PoolMiningThreads,
      setP2PoolMiningThreads,
      isP2PoolStratumPublic,
      setIsP2PoolStratumPublic,
    },
  };
};
