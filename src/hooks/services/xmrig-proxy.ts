import { useQueryState, parseAsBoolean } from "nuqs";

export const useXmrigProxyService = () => {
  const [isXmrigProxy, setIsXmrigProxy] = useQueryState(
    "isXmrigProxy",
    parseAsBoolean.withDefault(false)
  );
  const [isXmrigProxyPublic, setIsXmrigProxyPublic] = useQueryState(
    "isXmrigProxyPublic",
    parseAsBoolean.withDefault(false)
  );

  return {
    stateFunctions: {
      isXmrigProxy,
      setIsXmrigProxy,
      isXmrigProxyPublic,
      setIsXmrigProxyPublic,
    },
  };
};
