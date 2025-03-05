import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon mining configuration settings
 */
export const useMiningConfig = () => {
  const [startMining, setStartMining] = useQueryState(
    "startMining",
    parseAsString.withDefault("")
  );
  
  const [miningThreads, setMiningThreads] = useQueryState(
    "miningThreads",
    parseAsString.withDefault("1")
  );
  
  const [bgMiningEnable, setBgMiningEnable] = useQueryState(
    "bgMiningEnable",
    parseAsBoolean.withDefault(false)
  );
  
  const [bgMiningIgnoreBattery, setBgMiningIgnoreBattery] = useQueryState(
    "bgMiningIgnoreBattery",
    parseAsBoolean.withDefault(false)
  );

  return {
    startMining,
    setStartMining,
    miningThreads,
    setMiningThreads,
    bgMiningEnable,
    setBgMiningEnable,
    bgMiningIgnoreBattery,
    setBgMiningIgnoreBattery,
  };
};
