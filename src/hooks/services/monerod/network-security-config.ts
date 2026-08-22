import { useQueryState, parseAsBoolean, parseAsString, parseAsStringEnum } from "nuqs";
import { MONEROD_BAN_LIST_PATH } from "@/lib/constants";
import { DnsCheckpointsMode } from "./types";

/**
 * Hook for Monero daemon network security configuration settings
 */
export const useNetworkSecurityConfig = () => {
  const [banList, setBanList] = useQueryState(
    "banList",
    parseAsString.withDefault(MONEROD_BAN_LIST_PATH)
  );
  
  const [enableDnsBlocklist, setEnableDnsBlocklist] = useQueryState(
    "enableDnsBlocklist",
    parseAsBoolean.withDefault(true)
  );
  
  const [dnsCheckpoints, setDnsCheckpoints] = useQueryState(
    "dnsCheckpoints",
    parseAsStringEnum<DnsCheckpointsMode>(["default", "skip", "enforce"]).withDefault("default")
  );

  return {
    banList,
    setBanList,
    enableDnsBlocklist,
    setEnableDnsBlocklist,
    dnsCheckpoints,
    setDnsCheckpoints,
  };
};
