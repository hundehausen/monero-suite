import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon Tor/I2P configuration settings
 */
export const useTorI2PConfig = () => {
  const [padTransactions, setPadTransactions] = useQueryState(
    "padTransactions",
    parseAsBoolean.withDefault(false)
  );
  
  const [anonymousInbound, setAnonymousInbound] = useQueryState(
    "anonymousInbound",
    parseAsString.withDefault("")
  );

  return {
    padTransactions,
    setPadTransactions,
    anonymousInbound,
    setAnonymousInbound,
  };
};
