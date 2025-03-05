import { useQueryState, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon transaction pool configuration settings
 */
export const useTxPoolConfig = () => {
  const [maxTxpoolWeight, setMaxTxpoolWeight] = useQueryState(
    "maxTxpoolWeight",
    parseAsString.withDefault("2684354560")
  );

  return {
    maxTxpoolWeight,
    setMaxTxpoolWeight,
  };
};
