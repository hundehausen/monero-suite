import { useQueryState, parseAsBoolean } from "nuqs";
import { NetworkMode, networkModes, Service } from "./types";
import { architectures } from "./types";

/**
 * Hook for Cuprate service configuration
 * Cuprate is an experimental alternative implementation of Monero node in Rust
 */
export const useCuprateService = () => {
  const [isCuprateEnabled, setIsCuprateEnabled] = useQueryState(
    "isCuprateEnabled",
    parseAsBoolean.withDefault(false)
  );

  const getCuprateService = (
    networkMode: NetworkMode
  ): Service => {
    const service: Service = {
      name: "Cuprate (Experimental)",
      description: "Cuprate is an alternative Monero node implementation written in Rust. This project is experimental and not ready for production use.",
      checked: isCuprateEnabled,
      required: false,
      architecture: [architectures.linuxAmd, architectures.linuxArm],
      volumes: {
        "cuprate-data": {},
      },
      code: {
        cuprate: {
          image: "ghcr.io/hundehausen/cuprate-docker:latest",
          container_name: "cuprate",
          restart: "unless-stopped",
          volumes: [
            "cuprate-data:/home/cuprate/.local/share/cuprate"
          ],
          ports: networkMode === networkModes.exposed ? ["18082:18080"] : ["127.0.0.1:18080:18080"],
          networks: ["monero-network"],
        },
      },
      networks: {
        "monero-network": {
          external: false,
        },
      },
    };

    return service;
  };

  return {
    getCuprateService,
    stateFunctions: {
      isCuprateEnabled,
      setIsCuprateEnabled
    },
  };
};
