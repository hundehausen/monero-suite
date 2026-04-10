import { useQueryState, parseAsBoolean } from "nuqs";
import { Service } from "./types";
import { createAutohealService } from "@/lib/service-generators/autoheal";

export const useAutohealService = () => {
  const [isAutoheal, setIsAutoheal] = useQueryState(
    "isAutoheal",
    parseAsBoolean.withDefault(false)
  );

  const getAutohealService = (): Service =>
    createAutohealService(isAutoheal);

  return {
    getAutohealService,
    stateFunctions: {
      isAutoheal,
      setIsAutoheal,
    },
  };
};
