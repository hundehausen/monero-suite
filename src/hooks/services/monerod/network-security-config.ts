import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon network security configuration settings
 */
export const useNetworkSecurityConfig = () => {
  const [banList, setBanList] = useQueryState(
    "banList",
    parseAsString.withDefault("/home/monero/ban_list.txt")
  );
  
  const [enableDnsBlocklist, setEnableDnsBlocklist] = useQueryState(
    "enableDnsBlocklist",
    parseAsBoolean.withDefault(true)
  );
  
  const [disableDnsCheckpoints, setDisableDnsCheckpoints] = useQueryState(
    "disableDnsCheckpoints",
    parseAsBoolean.withDefault(false)
  );

  return {
    banList,
    setBanList,
    enableDnsBlocklist,
    setEnableDnsBlocklist,
    disableDnsCheckpoints,
    setDisableDnsCheckpoints,
  };
};
