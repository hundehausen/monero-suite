import { useQueryState, parseAsBoolean } from "nuqs";

export const useWatchtowerService = () => {
  const [isWatchtower, setIsWatchtower] = useQueryState(
    "isWatchtower",
    parseAsBoolean.withDefault(false)
  );

  return {
    stateFunctions: {
      isWatchtower,
      setIsWatchtower,
    },
  };
};
