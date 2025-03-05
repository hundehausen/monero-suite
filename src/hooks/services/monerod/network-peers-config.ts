import { useQueryState, parseAsString } from "nuqs";

/**
 * Hook for Monero daemon network peers configuration settings
 */
export const useNetworkPeersConfig = () => {
  const [seedNode, setSeedNode] = useQueryState(
    "seedNode",
    parseAsString.withDefault("")
  );
  
  const [addPeer, setAddPeer] = useQueryState(
    "addPeer",
    parseAsString.withDefault("")
  );
  
  const [addPriorityNode, setAddPriorityNode] = useQueryState(
    "addPriorityNode",
    parseAsString.withDefault("")
  );
  
  const [addExclusiveNode, setAddExclusiveNode] = useQueryState(
    "addExclusiveNode",
    parseAsString.withDefault("")
  );

  return {
    seedNode,
    setSeedNode,
    addPeer,
    setAddPeer,
    addPriorityNode,
    setAddPriorityNode,
    addExclusiveNode,
    setAddExclusiveNode,
  };
};
