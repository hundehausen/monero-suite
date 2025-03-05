import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon P2P network configuration settings
 */
export const useP2PNetworkConfig = () => {
  const [p2pBindPort, setP2pBindPort] = useQueryState(
    "p2pBindPort", 
    parseAsString.withDefault("18080")
  );
  
  const [outPeers, setOutPeers] = useQueryState(
    "outPeers", 
    parseAsString.withDefault("32")
  );
  
  const [inPeers, setInPeers] = useQueryState(
    "inPeers", 
    parseAsString.withDefault("48")
  );
  
  const [limitRateUp, setLimitRateUp] = useQueryState(
    "limitRateUp", 
    parseAsString.withDefault("1048576")
  );
  
  const [limitRateDown, setLimitRateDown] = useQueryState(
    "limitRateDown", 
    parseAsString.withDefault("1048576")
  );
  
  const [noIgd, setNoIgd] = useQueryState(
    "noIgd", 
    parseAsBoolean.withDefault(true)
  );
  
  const [hidePort, setHidePort] = useQueryState(
    "hidePort", 
    parseAsBoolean.withDefault(false)
  );
  
  const [allowLocalIp, setAllowLocalIp] = useQueryState(
    "allowLocalIp",
    parseAsBoolean.withDefault(false)
  );
  
  const [maxConnectionsPerIp, setMaxConnectionsPerIp] = useQueryState(
    "maxConnectionsPerIp",
    parseAsString.withDefault("1")
  );
  
  const [p2pExternalPort, setP2pExternalPort] = useQueryState(
    "p2pExternalPort",
    parseAsString.withDefault("0")
  );
  
  const [offlineMode, setOfflineMode] = useQueryState(
    "offlineMode",
    parseAsBoolean.withDefault(false)
  );

  return {
    p2pBindPort,
    setP2pBindPort,
    outPeers,
    setOutPeers,
    inPeers,
    setInPeers,
    limitRateUp,
    setLimitRateUp,
    limitRateDown,
    setLimitRateDown,
    noIgd,
    setNoIgd,
    hidePort,
    setHidePort,
    allowLocalIp,
    setAllowLocalIp,
    maxConnectionsPerIp,
    setMaxConnectionsPerIp,
    p2pExternalPort,
    setP2pExternalPort,
    offlineMode,
    setOfflineMode,
  };
};
