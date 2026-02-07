import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon performance configuration settings
 */
export const usePerformanceConfig = () => {
  const [dbSyncMode, setDbSyncMode] = useQueryState(
    "dbSyncMode", 
    parseAsString.withDefault("fast")
  );
  
  const [blockSyncSize, setBlockSyncSize] = useQueryState(
    "blockSyncSize", 
    parseAsString.withDefault("0")
  );
  
  const [enforceCheckpointing, setEnforceCheckpointing] = useQueryState(
    "enforceCheckpointing", 
    parseAsBoolean.withDefault(false)
  );
  
  const [fastBlockSync, setFastBlockSync] = useQueryState(
    "fastBlockSync", 
    parseAsBoolean.withDefault(true)
  );
  
  const [preparationThreads, setPreparationThreads] = useQueryState(
    "preparationThreads", 
    parseAsString.withDefault("4")
  );
  
  const [maxConcurrency, setMaxConcurrency] = useQueryState(
    "maxConcurrency", 
    parseAsString.withDefault("0")
  );
  
  const [bootstrapDaemonAddress, setBootstrapDaemonAddress] = useQueryState(
    "bootstrapDaemonAddress",
    parseAsString.withDefault("")
  );
  
  const [bootstrapDaemonLogin, setBootstrapDaemonLogin] = useQueryState(
    "bootstrapDaemonLogin",
    parseAsString.withDefault("")
  );

  return {
    dbSyncMode,
    setDbSyncMode,
    blockSyncSize,
    setBlockSyncSize,
    enforceCheckpointing,
    setEnforceCheckpointing,
    fastBlockSync,
    setFastBlockSync,
    preparationThreads,
    setPreparationThreads,
    maxConcurrency,
    setMaxConcurrency,
    bootstrapDaemonAddress,
    setBootstrapDaemonAddress,
    bootstrapDaemonLogin,
    setBootstrapDaemonLogin,
  };
};
