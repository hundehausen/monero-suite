import { useQueryState, parseAsBoolean } from "nuqs";

export const useCuprateService = () => {
  const [isCuprateEnabled, setIsCuprateEnabled] = useQueryState(
    "isCuprateEnabled",
    parseAsBoolean.withDefault(false)
  );

  return {
    stateFunctions: {
      isCuprateEnabled,
      setIsCuprateEnabled
    },
  };
};
