import type { FullConfig } from "./config-schema";
import { isPlaceholderDomain } from "./docker-helpers";
import { getDefaultSecretWarnings } from "./default-secrets";
import {
  MONEROD_PORTS,
  MONEROD_STAGENET_PORTS,
  P2POOL_PORTS,
  SERVICE_PORTS,
} from "./constants";
import { networkModes, p2poolModes, torProxyModes } from "./service-types";
import { anyHiddenService } from "./service-generators/ctx";
import { isXmrigProxyEffective } from "./service-generators/xmrig-proxy";

/** GiB we warn below for a pruned mainnet node. About 2/3 smaller than full. */
export const PRUNED_NODE_DISK_GB = 100;
/** GiB we warn below for a full mainnet node. */
export const FULL_NODE_DISK_GB = 250;

export type AccessLine = {
  label: string;
  url: string;
};

export type InstallScriptHints = {
  accessLines: AccessLine[];
  secretWarnings: string[];
  blockchainPath: string;
  isPrunedNode: boolean;
  hasHiddenServices: boolean;
  offlineMode: boolean;
};

export function emptyInstallScriptHints(): InstallScriptHints {
  return {
    accessLines: [],
    secretWarnings: [],
    blockchainPath: "",
    isPrunedNode: false,
    hasHiddenServices: false,
    offlineMode: false,
  };
}

export function bashSingleQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function publishedHost(
  networkMode: FullConfig["networkMode"],
  allInterfaces: boolean
): string {
  if (allInterfaces || networkMode === networkModes.local) return "localhost";
  return "127.0.0.1";
}

function localUrl(
  config: FullConfig,
  port: number,
  scheme: "http" | "https",
  allInterfaces = false
): string {
  return `${scheme}://${publishedHost(config.networkMode, allInterfaces)}:${port}`;
}

function traefikOrLocal(
  config: FullConfig,
  traefikForService: boolean,
  domain: string,
  port: number,
  localScheme: "http" | "https" = "http"
): string {
  if (
    config.services.isTraefik &&
    traefikForService &&
    !isPlaceholderDomain(domain)
  ) {
    return `https://${domain}`;
  }
  return localUrl(config, port, localScheme);
}

export function installScriptHintsFromConfig(
  config: FullConfig
): InstallScriptHints {
  const accessLines: AccessLine[] = [];
  const s = config.services;

  accessLines.push({
    label: "Monero restricted RPC",
    url: traefikOrLocal(
      config,
      s.isTraefikMonerod,
      config.monerod.moneroNodeDomain,
      MONEROD_PORTS.rpcRestricted
    ),
  });

  if (s.isMonitoring) {
    accessLines.push({
      label: "Grafana",
      url: traefikOrLocal(
        config,
        s.isTraefikGrafana,
        s.grafanaDomain,
        SERVICE_PORTS.grafana
      ),
    });
  }

  if (s.isPortainer) {
    accessLines.push({
      label: "Portainer",
      url: traefikOrLocal(
        config,
        s.isTraefikPortainer,
        s.portainerDomain,
        SERVICE_PORTS.portainerSsl,
        "https"
      ),
    });
  }

  if (s.isMoneroWalletRpc) {
    accessLines.push({
      label: "Wallet RPC",
      url: localUrl(config, SERVICE_PORTS.moneroWalletRpc, "http"),
    });
  }

  if (s.isMoneroLws) {
    accessLines.push({
      label: "Light wallet server",
      url: traefikOrLocal(
        config,
        s.isTraefikLws,
        s.lwsDomain,
        SERVICE_PORTS.moneroLws
      ),
    });
    accessLines.push({
      label: "LWS admin API",
      url: localUrl(config, SERVICE_PORTS.moneroLwsAdmin, "http"),
    });
  }

  if (s.isMoneroPay) {
    accessLines.push({
      label: "MoneroPay",
      url: traefikOrLocal(
        config,
        s.isTraefikMoneroPay,
        s.moneroPayDomain,
        SERVICE_PORTS.moneroPay
      ),
    });
  }

  if (config.p2pool.p2PoolMode !== p2poolModes.none) {
    accessLines.push({
      label: "P2Pool stratum",
      url: `${publishedHost(config.networkMode, config.p2pool.isP2PoolStratumPublic)}:${P2POOL_PORTS.stratum}`,
    });
  }

  if (
    isXmrigProxyEffective(
      s.isXmrigProxy,
      config.p2pool.p2PoolMode,
      config.architecture
    )
  ) {
    accessLines.push({
      label: "XMRig proxy",
      url: `${publishedHost(config.networkMode, s.isXmrigProxyPublic)}:${SERVICE_PORTS.xmrigProxy}`,
    });
  }

  if (s.isCuprateEnabled) {
    accessLines.push({
      label: "Cuprate RPC",
      url: localUrl(config, SERVICE_PORTS.cuprateRpc, "http"),
    });
  }

  if (config.stagenet.isStagenetNode) {
    accessLines.push({
      label: "Stagenet restricted RPC",
      url: traefikOrLocal(
        config,
        s.isTraefikStagenet,
        config.stagenet.stagenetNodeDomain,
        MONEROD_STAGENET_PORTS.rpcRestricted
      ),
    });
  }

  if (
    config.tor.torProxyMode !== torProxyModes.none &&
    config.tor.isGlobalTorProxy
  ) {
    accessLines.push({
      label: "Tor SOCKS",
      url: `${publishedHost(config.networkMode, false)}:${SERVICE_PORTS.torSocks}`,
    });
  }

  return {
    accessLines,
    secretWarnings: getDefaultSecretWarnings(config).map((w) => w.message),
    blockchainPath: config.monerod.isMoneroMainnetVolume
      ? ""
      : config.monerod.moneroMainnetBlockchainLocation,
    isPrunedNode: config.monerod.isPrunedNode,
    hasHiddenServices: anyHiddenService(config.tor),
    offlineMode: config.monerod.offlineMode,
  };
}

export function renderAccessUrlEchoes(lines: AccessLine[]): string {
  if (lines.length === 0) {
    return `    echo -e "  \${GRAY}See docker compose ps for published ports.\${NC}"`;
  }
  return lines
    .map(
      (line) =>
        `    printf '  %s  %s\\n' ${bashSingleQuote(line.label)} ${bashSingleQuote(line.url)}`
    )
    .join("\n");
}

export function renderSecretWarningEchoes(warnings: string[]): string {
  if (warnings.length === 0) return "";
  const lines = warnings.map(
    (warning) =>
      `    echo -e "\${YELLOW}"${bashSingleQuote(warning)}"\${NC}"`
  );
  return `    echo\n${lines.join("\n")}`;
}
