import { useQueryState, parseAsString } from "nuqs";

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
