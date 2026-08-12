// Centralized constants for the Monero Suite Docker configuration generator.
// All network IPs, ports, and image references live here to avoid
// scattered magic values across service hooks.

// Docker network configuration for Tor proxy mode
export const DOCKER_NETWORK = {
  name: "tor-proxy",
  subnet: "172.28.1.0/24",
  driver: "bridge",
} as const;

// Static IP addresses assigned to services within the Tor Docker network
export const SERVICE_IPS = {
  tor: "172.28.1.2",
  monerod: "172.28.1.3",
  monerodStagenet: "172.28.1.4",
  p2pool: "172.28.1.5",
  grafana: "172.28.1.8",
} as const;

// Monero daemon ports
export const MONEROD_PORTS = {
  p2p: 18080,
  rpcUnrestricted: 18081,
  zmqRpc: 18082,
  zmqPub: 18083,
  torP2p: 18084,
  rpcRestricted: 18089,
} as const;

// Monero stagenet daemon ports
export const MONEROD_STAGENET_PORTS = {
  p2p: 38080,
  rpcUnrestricted: 38081,
  rpcRestricted: 38089,
} as const;

// P2Pool ports
export const P2POOL_PORTS = {
  stratum: 3333,
  p2pMini: 37888,
  p2pFull: 37889,
  p2pNano: 37890,
} as const;

// Other service ports
export const SERVICE_PORTS = {
  grafana: 3000,
  moneroWalletRpc: 18082,
  moneroLws: 8443,
  moneroLwsAdmin: 8081,
  moneroPay: 5000,
  xmrigProxy: 3334,
  portainer: 9000,
  portainerSsl: 9443,
  traefikHttp: 80,
  traefikHttps: 443,
  torSocks: 9050,
  cuprateRpc: 18090,
} as const;

export const GRAFANA_LOCAL_DOMAIN = `localhost:${SERVICE_PORTS.grafana}` as const;
export const GRAFANA_TRAEFIK_DEFAULT_DOMAIN = "monitor.example.com" as const;

// Docker image references.
// Using :latest tags is intentional — users often run Watchtower for
// automatic updates, and pinned versions would require manual bumps.
export const DOCKER_IMAGES = {
  monerod: "ghcr.io/sethforprivacy/simple-monerod:latest",
  moneroWalletRpc: "ghcr.io/sethforprivacy/simple-monero-wallet-rpc:latest",
  p2pool: "ghcr.io/sethforprivacy/p2pool:latest",
  tor: "ghcr.io/hundehausen/tor-hidden-service:latest",
  traefik: "traefik:latest",
  grafana: "grafana/grafana:latest",
  prometheus: "prom/prometheus:latest",
  monerodExporter: "lalanza808/exporter:1.0.0",
  nodemapper: "lalanza808/nodemapper:1.0.4",
  watchtower: "ghcr.io/nicholas-fedor/watchtower:latest",
  xmrig: "ghcr.io/metal3d/xmrig:latest",
  portainer: "portainer/portainer-ce:latest",
  cuprate: "ghcr.io/hundehausen/cuprate-docker:latest",
  moneroLws: "ghcr.io/vtnerd/monero-lws:latest",
  moneroPay: "registry.gitlab.com/moneropay/moneropay:v2",
  xmrigProxy: "xmrig/xmrig-proxy:latest",
} as const;

export const LWS_TRAEFIK_DEFAULT_DOMAIN = "lws.example.com" as const;
export const MONEROPAY_TRAEFIK_DEFAULT_DOMAIN = "pay.example.com" as const;
