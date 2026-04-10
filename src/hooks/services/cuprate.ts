import { useQueryState, parseAsBoolean } from "nuqs";
import { NetworkMode, Service } from "./types";
import { createCuprateService } from "@/lib/service-generators/cuprate";

export const useCuprateService = () => {
  const [isCuprateEnabled, setIsCuprateEnabled] = useQueryState(
    "isCuprateEnabled",
    parseAsBoolean.withDefault(false)
  );

  const getCuprateService = (
    networkMode: NetworkMode
  ): Service =>
    createCuprateService(isCuprateEnabled, networkMode);

  return {
    getCuprateService,
    stateFunctions: {
      isCuprateEnabled,
      setIsCuprateEnabled
    },
  };
};
