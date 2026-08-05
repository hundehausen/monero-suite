import { networkModes, NetworkMode, torProxyModes, TorProxyMode } from "@/hooks/services/types";
import { safeParse, domainSchema } from "@/lib/schemas";
import { DOCKER_NETWORK } from "@/lib/constants";

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
 * Sanitize a raw domain and generate Traefik labels in one step.
 * Returns the sanitized domain (for use in URLs/descriptions) and the labels.
 */
export function getTraefikConfig(
  isTraefik: boolean,
  serviceName: string,
  rawDomain: string,
  port: string,
  certResolverName: string,
  fallbackDomain: string = ""
) {
  const domain = safeParse(domainSchema, rawDomain, fallbackDomain);
  return {
    domain,
    labels: getTraefikLabels(isTraefik, serviceName, domain, port, certResolverName),
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
 * Dual-home a service on the default Compose network and tor-proxy
 * with a static IP. Listing only the Tor net would drop the default network
 * and break peers that stay on default (monitoring, wallet-rpc, Traefik, etc.).
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
      default: {},
      [DOCKER_NETWORK.name]: {
        ipv4_address: ipv4Address,
        ...(aliases ? { aliases } : {}),
      },
    },
  };
}

/**
 * Dual-home a client service so it can reach monerod/p2pool on the Tor net
 * without leaving the default network (prometheus↔grafana, Traefik backends).
 * Returns empty object when Tor proxy is disabled.
 */
export function getTorClientNetworkConfig(
  torProxyMode: TorProxyMode,
  aliases?: string[]
): Record<string, unknown> {
  if (torProxyMode === torProxyModes.none) return {};
  return {
    networks: {
      default: {},
      [DOCKER_NETWORK.name]: aliases ? { aliases } : {},
    },
  };
}
