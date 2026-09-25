import { useQueryState, parseAsBoolean } from "nuqs";

export const useFcmpStressnetService = () => {
  const [isFcmpStressnet, setIsFcmpStressnet] = useQueryState(
    "isFcmpStressnet",
    parseAsBoolean.withDefault(false)
  );
  const [isFcmpStressnetPublic, setIsFcmpStressnetPublic] = useQueryState(
    "isFcmpStressnetPublic",
    parseAsBoolean.withDefault(false)
  );
  const [isFcmpStressnetPruned, setIsFcmpStressnetPruned] = useQueryState(
    "isFcmpStressnetPruned",
    parseAsBoolean.withDefault(false)
  );

  return {
    stateFunctions: {
      isFcmpStressnet,
      setIsFcmpStressnet,
      isFcmpStressnetPublic,
      setIsFcmpStressnetPublic,
      isFcmpStressnetPruned,
      setIsFcmpStressnetPruned,
    },
  };
};
