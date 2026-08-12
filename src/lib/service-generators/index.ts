import type { FullConfig } from "@/lib/config-schema";
import type { ServiceMap } from "@/hooks/services/types";
import { MONEROD_PORTS } from "@/lib/constants";
import { stackNeedsZmq } from "@/lib/stack-needs-zmq";
import { getZmqPubPort, createMonerodService } from "./monerod";
import { createMonerodStagenetService } from "./monerod-stagenet";
import { createP2PoolService } from "./p2pool";
import { createMoneroWalletRpcService } from "./monero-wallet-rpc";
import { createTorService } from "./tor";
import { createWatchtowerService } from "./watchtower";
import { createMonitoringService } from "./monitoring";
import { createXmrigService } from "./xmrig";
import { createTraefikService } from "./traefik";
import { createPortainerService } from "./portainer";
import { createCuprateService } from "./cuprate";
import { CERT_RESOLVER_NAME } from "./traefik";

export { CERT_RESOLVER_NAME } from "./traefik";

export function generateAllServices(config: FullConfig): ServiceMap {
  const { networkMode, tor, p2pool, mining, services } = config;

  const isTraefik = services.isTraefik;

  // The port monerod actually binds ZMQ on — consumers must follow it. Never
  // published on the host: p2pool reaches it over the Docker net.
  const zmqPubPort =
    getZmqPubPort(
      config.monerod.zmqPubEnabled,
      config.monerod.zmqPubBindPort,
      stackNeedsZmq(p2pool.p2PoolMode, services.isMonitoring, services.isMoneroLws)
    ) ?? MONEROD_PORTS.zmqPub;

  const servicesMap: ServiceMap = {
    monerod: createMonerodService(config.monerod, networkMode, p2pool.p2PoolMode, tor.torProxyMode, services.isMonitoring, services.isMoneroLws, tor.hsMonerod || tor.hsMonerodP2P || tor.hsStagenet || tor.hsP2Pool || tor.hsGrafana, isTraefik && services.isTraefikMonerod, CERT_RESOLVER_NAME),
    "monerod-stagenet": createMonerodStagenetService(config.stagenet, config.monerod.moneroNodeNoLogs, networkMode, isTraefik && services.isTraefikStagenet, CERT_RESOLVER_NAME, tor.torProxyMode),
    p2pool: createP2PoolService(p2pool, mining.miningMode, tor.torProxyMode, networkMode, zmqPubPort),
    "monero-wallet-rpc": createMoneroWalletRpcService(services.isMoneroWalletRpc, networkMode, tor.torProxyMode),
    tor: createTorService(tor, networkMode, config.stagenet.isStagenetNode, p2pool.p2PoolMode, services.isMonitoring),
    watchtower: createWatchtowerService(services.isWatchtower),
    monitoring: createMonitoringService(services.isMonitoring, services.grafanaDomain, networkMode, isTraefik && services.isTraefikGrafana, CERT_RESOLVER_NAME, tor.torProxyMode),
    xmrig: createXmrigService(mining.miningMode, mining.xmrigDonateLevel, tor.torProxyMode, p2pool.p2PoolMode),
    traefik: createTraefikService(isTraefik, tor.torProxyMode),
    portainer: createPortainerService(services.isPortainer, services.portainerDomain, networkMode, isTraefik && services.isTraefikPortainer, CERT_RESOLVER_NAME),
    cuprate: createCuprateService(services.isCuprateEnabled, networkMode),
  };

  return servicesMap;
}
