import { useQueryState, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon notifications configuration settings
 */
export const useNotificationsConfig = () => {
  const [blockNotify, setBlockNotify] = useQueryState(
    "blockNotify",
    parseAsString.withDefault("")
  );
  
  const [reorgNotify, setReorgNotify] = useQueryState(
    "reorgNotify",
    parseAsString.withDefault("")
  );
  
  const [blockRateNotify, setBlockRateNotify] = useQueryState(
    "blockRateNotify",
    parseAsString.withDefault("")
  );

  return {
    blockNotify,
    setBlockNotify,
    reorgNotify,
    setReorgNotify,
    blockRateNotify,
    setBlockRateNotify,
  };
};
