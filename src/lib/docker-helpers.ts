import { networkModes, NetworkMode, torProxyModes, TorProxyMode } from "@/hooks/services/types";

/**
 * Generate Traefik router labels for a service.
 * Returns undefined when Traefik is disabled.
 */
export function getTraefikLabels(
  isTraefik: boolean,
  serviceName: string,
  domain: string,
  port: string,
  certResolverName: string
): Record<string, string> | undefined {
  if (!isTraefik) return undefined;
  return {
    "traefik.enable": "true",
    [`traefik.http.routers.${serviceName}.rule`]: `Host(\`${domain}\`)`,
    [`traefik.http.routers.${serviceName}.entrypoints`]: "websecure",
    [`traefik.http.routers.${serviceName}.tls.certresolver`]: certResolverName,
    [`traefik.http.services.${serviceName}.loadbalancer.server.port`]: port,
  };
}

/**
 * Generate a port binding string that binds to localhost in exposed mode
 * and all interfaces in local mode.
 */
export function getPortBinding(
  networkMode: NetworkMode,
  port: string | number,
  internalPort?: string | number
): string {
  const internal = internalPort ?? port;
  return networkMode === networkModes.local
    ? `${port}:${internal}`
    : `127.0.0.1:${port}:${internal}`;
}

/**
 * Generate the Tor network configuration block for a service.
 * Returns empty object when Tor proxy is disabled.
 */
export function getTorNetworkConfig(
  torProxyMode: TorProxyMode,
  ipv4Address: string,
  aliases?: string[]
): Record<string, unknown> {
  if (torProxyMode === torProxyModes.none) return {};
  return {
    networks: {
      monero_suite_net: {
        ipv4_address: ipv4Address,
        ...(aliases ? { aliases } : {}),
      },
    },
  };
}
