import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

/**
 * Hook for basic Monero daemon configuration settings
 */
export const useBasicConfig = () => {
  const [isMoneroPublicNode, setIsMoneroPublicNode] = useQueryState(
    "isMoneroPublicNode",
    parseAsBoolean.withDefault(true)
  );
  
  const [moneroNodeNoLogs, setMoneroNodeNoLogs] = useQueryState(
    "moneroNodeNoLogs",
    parseAsBoolean.withDefault(false)
  );
  
  const [moneroNodeDomain, setMoneroNodeDomain] = useQueryState(
    "moneroNodeDomain",
    parseAsString.withDefault("node.example.com")
  );
  
  const [isPrunedNode, setIsPrunedNode] = useQueryState(
    "isPrunedNode",
    parseAsBoolean.withDefault(false)
  );
  
  const [isSyncPrunedBlocks, setIsSyncPrunedBlocks] = useQueryState(
    "isSyncPrunedBlocks",
    parseAsBoolean.withDefault(false)
  );
  
  const [isMoneroMainnetVolume, setIsMoneroMainnetVolume] = useQueryState(
    "isMoneroMainnetVolume",
    parseAsBoolean.withDefault(true)
  );
  
  const [moneroMainnetBlockchainLocation, setMoneroMainnetBlockchainLocation] =
    useQueryState(
      "moneroMainnetBlockchainLocation",
      parseAsString.withDefault("~/.bitmonero")
    );

  return {
    isMoneroPublicNode,
    setIsMoneroPublicNode,
    moneroNodeNoLogs,
    setMoneroNodeNoLogs,
    moneroNodeDomain,
    setMoneroNodeDomain,
    isPrunedNode,
    setIsPrunedNode,
    isSyncPrunedBlocks,
    setIsSyncPrunedBlocks,
    isMoneroMainnetVolume,
    setIsMoneroMainnetVolume,
    moneroMainnetBlockchainLocation,
    setMoneroMainnetBlockchainLocation,
  };
};
