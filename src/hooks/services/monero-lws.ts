import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { LWS_TRAEFIK_DEFAULT_DOMAIN } from "@/lib/constants";

export const useMoneroLwsService = () => {
  const [isMoneroLws, setIsMoneroLws] = useQueryState(
    "isMoneroLws",
    parseAsBoolean.withDefault(false)
  );
  const [lwsDomain, setLwsDomain] = useQueryState(
    "lwsDomain",
    parseAsString.withDefault(LWS_TRAEFIK_DEFAULT_DOMAIN)
  );

  return {
    stateFunctions: { isMoneroLws, setIsMoneroLws, lwsDomain, setLwsDomain },
  };
};
