import { useQueryState, parseAsBoolean } from "nuqs";
import { CERT_RESOLVER_NAME as _CERT_RESOLVER_NAME } from "@/lib/service-generators/traefik";

export const CERT_RESOLVER_NAME = _CERT_RESOLVER_NAME;

export const useTraefikService = () => {
  const [isTraefik, setIsTraefik] = useQueryState(
    "isTraefik",
    parseAsBoolean.withDefault(false)
  );
  const [isTraefikMonerod, setIsTraefikMonerod] = useQueryState(
    "isTraefikMonerod",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikStagenet, setIsTraefikStagenet] = useQueryState(
    "isTraefikStagenet",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikGrafana, setIsTraefikGrafana] = useQueryState(
    "isTraefikGrafana",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikPortainer, setIsTraefikPortainer] = useQueryState(
    "isTraefikPortainer",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikLws, setIsTraefikLws] = useQueryState(
    "isTraefikLws",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikMoneroPay, setIsTraefikMoneroPay] = useQueryState(
    "isTraefikMoneroPay",
    parseAsBoolean.withDefault(true)
  );

  return {
    stateFunctions: {
      isTraefik,
      setIsTraefik,
      isTraefikMonerod,
      setIsTraefikMonerod,
      isTraefikStagenet,
      setIsTraefikStagenet,
      isTraefikGrafana,
      setIsTraefikGrafana,
      isTraefikPortainer,
      setIsTraefikPortainer,
      isTraefikLws,
      setIsTraefikLws,
      isTraefikMoneroPay,
      setIsTraefikMoneroPay,
    },
  };
};
