// Centralized constants for the Monero Suite Docker configuration generator.
// All network IPs, ports, and image references live here to avoid
// scattered magic values across service hooks.

// Docker network configuration for Tor proxy mode
export const DOCKER_NETWORK = {
  name: "monero_suite_net",
  subnet: "172.28.1.0/24",
  driver: "bridge",
} as const;

// Static IP addresses assigned to services within the Tor Docker network
export const SERVICE_IPS = {
  tor: "172.28.1.2",
  monerod: "172.28.1.3",
  monerodStagenet: "172.28.1.4",
  p2pool: "172.28.1.5",
  moneroblock: "172.28.1.6",
  explorer: "172.28.1.7",
  grafana: "172.28.1.8",
} as const;

// Monero daemon ports
export const MONEROD_PORTS = {
  p2p: 18080,
  rpcUnrestricted: 18081,
  zmqPub: 18084,
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
  moneroblock: 31312,
  explorerOnion: 8081,
  moneroWalletRpc: 18083,
  portainer: 8000,
  portainerSsl: 9443,
  traefikHttp: 80,
  traefikHttps: 443,
  torSocks: 9050,
  cuprateRpc: 18082,
} as const;

// Docker image references.
// Using :latest tags is intentional — users often run Watchtower for
// automatic updates, and pinned versions would require manual bumps.
export const DOCKER_IMAGES = {
  monerod: "ghcr.io/sethforprivacy/simple-monerod:latest",
  moneroWalletRpc: "sethsimmons/simple-monero-wallet-rpc:latest",
  p2pool: "ghcr.io/sethforprivacy/p2pool:latest",
  tor: "ghcr.io/hundehausen/tor-hidden-service:latest",
  traefik: "traefik:latest",
  grafana: "grafana/grafana:latest",
  prometheus: "prom/prometheus:latest",
  monerodExporter: "lalanza808/monerod_exporter:latest",
  nodemapper: "lalanza808/nodemapper:latest",
  autoheal: "willfarrell/autoheal:latest",
  watchtower: "nickfedor/watchtower:latest",
  xmrig: "metal3d/xmrig:latest",
  moneroblock: "sethsimmons/moneroblock:latest",
  portainer: "portainer/portainer-ce:latest",
  explorerOnion: "vdo1138/xmrblocks:latest",
  cuprate: "ghcr.io/hundehausen/cuprate-docker:latest",
} as const;
