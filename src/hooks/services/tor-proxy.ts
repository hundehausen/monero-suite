import { useQueryState, parseAsStringEnum } from "nuqs";
import {
  Service,
  architectures,
  networkModes,
  torProxyModes,
  TorProxyMode,
  NetworkMode,
} from "./types";

export const useTorProxyService = () => {
  const [torProxyMode, setTorProxyMode] = useQueryState<TorProxyMode>(
    "torProxyMode",
    parseAsStringEnum(Object.values(torProxyModes)).withDefault(
      torProxyModes.none
    )
  );

  const getTorProxyService = (networkMode: NetworkMode): Service => ({
    name: "Tor Proxy",
    description:
      "Tor Proxy is a proxy server that forwards traffic into the Tor network.",
    checked: torProxyMode !== torProxyModes.none,
    required: false,
    architecture: [architectures.linuxAmd],
    code: {
      "tor-proxy": {
        image: "ghcr.io/peterdavehello/tor-socks-proxy:latest",
        container_name: "tor-proxy",
        restart: "unless-stopped",
        ports: [
          ...(networkMode === networkModes.local
            ? ["9150:9150"]
            : ["127.0.0.1:9150:9150"]),
        ],
      },
    },
  });

  return {
    getTorProxyService,
    stateFunctions: {
      torProxyMode,
      setTorProxyMode,
    },
  };
};
