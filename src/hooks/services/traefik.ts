import { useQueryState, parseAsBoolean } from "nuqs";
import { Service } from "./types";
import { createTraefikService, CERT_RESOLVER_NAME as _CERT_RESOLVER_NAME } from "@/lib/service-generators/traefik";

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
  const [isTraefikMoneroblock, setIsTraefikMoneroblock] = useQueryState(
    "isTraefikMoneroblock",
    parseAsBoolean.withDefault(true)
  );
  const [isTraefikOnionExplorer, setIsTraefikOnionExplorer] = useQueryState(
    "isTraefikOnionExplorer",
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

  const getTraefikService = (): Service =>
    createTraefikService(isTraefik);

  return {
    getTraefikService,
    stateFunctions: {
      isTraefik,
      setIsTraefik,
      isTraefikMonerod,
      setIsTraefikMonerod,
      isTraefikStagenet,
      setIsTraefikStagenet,
      isTraefikMoneroblock,
      setIsTraefikMoneroblock,
      isTraefikOnionExplorer,
      setIsTraefikOnionExplorer,
      isTraefikGrafana,
      setIsTraefikGrafana,
      isTraefikPortainer,
      setIsTraefikPortainer,
    },
  };
};
