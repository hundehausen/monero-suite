import { useQueryState, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon logging configuration settings
 */
export const useLoggingConfig = () => {
  const [logLevel, setLogLevel] = useQueryState(
    "logLevel", 
    parseAsString.withDefault("0")
  );
  
  const [maxLogFileSize, setMaxLogFileSize] = useQueryState(
    "maxLogFileSize", 
    parseAsString.withDefault("1048576")
  );
  
  const [maxLogFiles, setMaxLogFiles] = useQueryState(
    "maxLogFiles", 
    parseAsString.withDefault("3")
  );

  return {
    logLevel,
    setLogLevel,
    maxLogFileSize,
    setMaxLogFileSize,
    maxLogFiles,
    setMaxLogFiles,
  };
};
