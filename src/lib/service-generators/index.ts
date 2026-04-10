import type { FullConfig } from "@/lib/config-schema";
import type { ServiceMap } from "@/hooks/services/types";
import { createMonerodService } from "./monerod";
import { createMonerodStagenetService } from "./monerod-stagenet";
import { createP2PoolService } from "./p2pool";
import { createMoneroWalletRpcService } from "./monero-wallet-rpc";
import { createMoneroblockService } from "./moneroblock";
import { createOnionMoneroBlockchainExplorerService } from "./onion-monero-blockchain-explorer";
import { createTorService } from "./tor";
import { createWatchtowerService } from "./watchtower";
import { createMonitoringService } from "./monitoring";
import { createAutohealService } from "./autoheal";
import { createXmrigService } from "./xmrig";
import { createTraefikService } from "./traefik";
import { createPortainerService } from "./portainer";
import { createCuprateService } from "./cuprate";
import { CERT_RESOLVER_NAME } from "./traefik";

export { CERT_RESOLVER_NAME } from "./traefik";

export function generateAllServices(config: FullConfig): ServiceMap {
  const { networkMode, tor, p2pool, mining, services } = config;

  const isTraefik = services.isTraefik;

  const servicesMap: ServiceMap = {
    monerod: createMonerodService(config.monerod, networkMode, p2pool.p2PoolMode, tor.torProxyMode, services.isMonitoring, tor.hsMonerod || tor.hsMonerodP2P || tor.hsStagenet || tor.hsP2Pool || tor.hsMoneroblock || tor.hsOnionExplorer || tor.hsGrafana, isTraefik && services.isTraefikMonerod, CERT_RESOLVER_NAME),
    "monerod-stagenet": createMonerodStagenetService(config.stagenet, config.monerod.moneroNodeNoLogs, networkMode, isTraefik && services.isTraefikStagenet, CERT_RESOLVER_NAME, tor.torProxyMode),
    p2pool: createP2PoolService(p2pool, mining.miningMode, tor.torProxyMode, networkMode),
    "monero-wallet-rpc": createMoneroWalletRpcService(services.isMoneroWalletRpc, networkMode),
    moneroblock: createMoneroblockService(services.isMoneroblock, services.isMoneroblockLoggingDisabled, services.moneroBlockDomain, networkMode, isTraefik && services.isTraefikMoneroblock, CERT_RESOLVER_NAME, tor.torProxyMode),
    "onion-monero-blockchain-explorer": createOnionMoneroBlockchainExplorerService(services.isOnionMoneroBlockchainExplorer, services.onionMoneroBlockchainExplorerDomain, networkMode, isTraefik && services.isTraefikOnionExplorer, CERT_RESOLVER_NAME, tor.torProxyMode),
    tor: createTorService(tor, networkMode, config.stagenet.isStagenetNode, p2pool.p2PoolMode, services.isMoneroblock, services.isOnionMoneroBlockchainExplorer, services.isMonitoring),
    watchtower: createWatchtowerService(services.isWatchtower),
    monitoring: createMonitoringService(services.isMonitoring, services.grafanaDomain, networkMode, isTraefik && services.isTraefikGrafana, CERT_RESOLVER_NAME, tor.torProxyMode),
    autoheal: createAutohealService(services.isAutoheal),
    xmrig: createXmrigService(mining.miningMode, mining.xmrigDonateLevel),
    traefik: createTraefikService(isTraefik),
    portainer: createPortainerService(services.isPortainer, services.portainerDomain, networkMode, isTraefik && services.isTraefikPortainer, CERT_RESOLVER_NAME),
    cuprate: createCuprateService(services.isCuprateEnabled, networkMode),
  };

  return servicesMap;
}
