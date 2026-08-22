import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";

export const useMonerodStagenetService = () => {
  const [isStagenetNode, setIsStagenetNode] = useQueryState(
    "isStagenetNode",
    parseAsBoolean.withDefault(false)
  );
  const [isStagenetNodePublic, setIsStagenetNodePublic] = useQueryState(
    "isStagenetNodePublic",
    parseAsBoolean.withDefault(true)
  );
  const [isMoneroStagenetCustomLocation, setIsMoneroStagenetCustomLocation] = useQueryState(
    "isMoneroStagenetCustomLocation",
    parseAsBoolean.withDefault(false)
  );
  const [
    moneroStagenetBlockchainLocation,
    setMoneroStagenetBlockchainLocation,
  ] = useQueryState(
    "moneroStagenetBlockchainLocation",
    parseAsString.withDefault("~/.bitmonero")
  );
  const [stagenetNodeDomain, setStagenetNodeDomain] = useQueryState(
    "stagenetNodeDomain",
    parseAsString.withDefault("stagenet.example.com")
  );

  return {
    stateFunctions: {
      isStagenetNode,
      setIsStagenetNode,
      isStagenetNodePublic,
      setIsStagenetNodePublic,
      isMoneroStagenetCustomLocation,
      setIsMoneroStagenetCustomLocation,
      moneroStagenetBlockchainLocation,
      setMoneroStagenetBlockchainLocation,
      stagenetNodeDomain,
      setStagenetNodeDomain,
    },
  };
};
