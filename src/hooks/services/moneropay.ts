import { useQueryState, parseAsBoolean, parseAsString } from "nuqs";
import { MONEROPAY_TRAEFIK_DEFAULT_DOMAIN } from "@/lib/constants";

export const useMoneroPayService = () => {
  const [isMoneroPay, setIsMoneroPay] = useQueryState(
    "isMoneroPay",
    parseAsBoolean.withDefault(false)
  );
  const [moneroPayDomain, setMoneroPayDomain] = useQueryState(
    "moneroPayDomain",
    parseAsString.withDefault(MONEROPAY_TRAEFIK_DEFAULT_DOMAIN)
  );

  return {
    stateFunctions: {
      isMoneroPay,
      setIsMoneroPay,
      moneroPayDomain,
      setMoneroPayDomain,
    },
  };
};
