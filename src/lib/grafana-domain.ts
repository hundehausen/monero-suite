import { GRAFANA_LOCAL_DOMAIN, GRAFANA_TRAEFIK_DEFAULT_DOMAIN } from "@/lib/constants";

/** True when domain is localhost or localhost:port (case-insensitive). */
function isGrafanaLocalDomain(domain: string): boolean {
  const host = domain.trim().toLowerCase().split(":")[0] ?? "";
  return host === "localhost" || host === "127.0.0.1";
}

/**
 * Next grafanaDomain after a Traefik/Grafana-toggle change.
 * Returns null when the domain should be left unchanged.
 */
export function nextGrafanaDomain(
  isTraefik: boolean,
  isTraefikGrafana: boolean,
  currentDomain: string
): string | null {
  if (!isTraefik || !isTraefikGrafana) {
    return currentDomain === GRAFANA_LOCAL_DOMAIN ? null : GRAFANA_LOCAL_DOMAIN;
  }
  if (isGrafanaLocalDomain(currentDomain)) {
    return GRAFANA_TRAEFIK_DEFAULT_DOMAIN;
  }
  return null;
}
