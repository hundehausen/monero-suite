type SectionDef = {
  value: string;
  label: string;
  description: string;
  keywords?: readonly string[];
};

export const SECTIONS = [
  {
    value: "architecture",
    label: "CPU Architecture",
    description: "linux/amd64 or linux/arm64",
  },
  {
    value: "exposed",
    label: "Where is your Docker host located?",
    description: "Local network or VPS",
  },
  {
    value: "system-packages",
    label: "System packages",
    description: "Optional apt/dnf upgrade during install",
    keywords: ["apt", "dnf", "upgrade", "packages", "update"],
  },
  {
    value: "mainnet-node",
    label: "Monero Node",
    description: "Always-on mainnet monerod",
  },
  {
    value: "stagenet-node",
    label: "Monero Stagenet Node",
    description: "Optional stagenet node",
  },
  {
    value: "monero-wallet-rpc",
    label: "Monero Wallet RPC",
    description: "Wallet RPC daemon",
  },
  {
    value: "monero-lws",
    label: "Light Wallet Server",
    description: "Remote view-only wallets",
  },
  {
    value: "moneropay",
    label: "MoneroPay",
    description: "Payment gateway, enables wallet RPC",
  },
  {
    value: "traefik",
    label: "Traefik Reverse Proxy",
    description: "TLS and domains — replace example.com before generate",
    keywords: ["domain", "example.com", "tls", "https"],
  },
  {
    value: "p2pool",
    label: "P2Pool",
    description: "Decentralized mining pool",
  },
  {
    value: "xmrig-proxy",
    label: "XMRig-proxy",
    description: "Stratum proxy in front of P2Pool",
  },
  {
    value: "tor",
    label: "Tor Proxy & Tor Hidden Services",
    description: "Tor proxy and onion services",
  },
  {
    value: "monitoring",
    label: "Monitoring",
    description: "Prometheus and Grafana",
  },
  {
    value: "portainer",
    label: "Portainer",
    description: "Docker UI",
  },
  {
    value: "watchtower",
    label: "Watchtower",
    description: "Auto-update containers",
  },
  {
    value: "cuprate-node",
    label: "Cuprate Node",
    description: "Experimental alternative node",
  },
] as const satisfies readonly SectionDef[];

export type SectionValue = (typeof SECTIONS)[number]["value"];

export const DEFAULT_OPEN_SECTIONS: SectionValue[] = [
  "architecture",
  "exposed",
  "system-packages",
  "mainnet-node",
];

export function sectionElementId(value: string): string {
  return `section-${value}`;
}

export function ensureSectionOpen(
  open: readonly string[],
  value: string
): string[] {
  return open.includes(value) ? [...open] : [...open, value];
}
