import { useQueryState, parseAsBoolean } from "nuqs";
import { Service } from "./types";
import { createWatchtowerService } from "@/lib/service-generators/watchtower";

export const useWatchtowerService = () => {
  const [isWatchtower, setIsWatchtower] = useQueryState(
    "isWatchtower",
    parseAsBoolean.withDefault(false)
  );

  const getWatchtowerService = (): Service =>
    createWatchtowerService(isWatchtower);

  return {
    getWatchtowerService,
    stateFunctions: {
      isWatchtower,
      setIsWatchtower,
    },
  };
};
