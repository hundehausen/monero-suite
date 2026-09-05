import type { FullConfig } from "@/lib/config-schema";
import type { Architecture, ServiceMap } from "@/lib/service-types";
import { stackNeedsZmq } from "@/lib/stack-needs-zmq";
import { getZmqPubPort, createMonerodService } from "./monerod";
import { createMonerodStagenetService } from "./monerod-stagenet";
import { createP2PoolService } from "./p2pool";
import { createMoneroWalletRpcService } from "./monero-wallet-rpc";
import { createTorService } from "./tor";
import { createWatchtowerService } from "./watchtower";
import { createMonitoringService } from "./monitoring";
import { createXmrigService } from "./xmrig";
import { createXmrigProxyService, isXmrigProxyEffective } from "./xmrig-proxy";
import { createTraefikService } from "./traefik";
import { createPortainerService } from "./portainer";
import { createCuprateService } from "./cuprate";
import { createMoneroLwsService } from "./monero-lws";
import { createMoneroPayService } from "./moneropay";
import { anyHiddenService, type GenerationCtx } from "./ctx";

export { anyHiddenService };

export function generationCtx(config: FullConfig): GenerationCtx {
  return {
    zmqPubPort: getZmqPubPort(
      config.monerod.zmqPubEnabled,
      config.monerod.zmqPubBindPort,
      stackNeedsZmq(
        config.p2pool.p2PoolMode,
        config.services.isMonitoring,
        config.services.isMoneroLws
      )
    ),
    isXmrigProxyOn: isXmrigProxyEffective(
      config.services.isXmrigProxy,
      config.p2pool.p2PoolMode,
      config.architecture
    ),
    anyHiddenService: anyHiddenService(config.tor),
  };
}

export function filterServicesByArchitecture(
  services: ServiceMap,
  architecture: Architecture
): ServiceMap {
  return Object.fromEntries(
    Object.entries(services).filter(([, service]) =>
      service.architecture?.includes(architecture)
    )
  );
}

export function generateAllServices(config: FullConfig): ServiceMap {
  const ctx = generationCtx(config);
  return {
    monerod: createMonerodService(config, ctx),
    "monerod-stagenet": createMonerodStagenetService(config),
    p2pool: createP2PoolService(config, ctx),
    "monero-wallet-rpc": createMoneroWalletRpcService(config),
    tor: createTorService(config, ctx),
    watchtower: createWatchtowerService(config),
    monitoring: createMonitoringService(config),
    xmrig: createXmrigService(config, ctx),
    "xmrig-proxy": createXmrigProxyService(config, ctx),
    traefik: createTraefikService(config),
    portainer: createPortainerService(config),
    cuprate: createCuprateService(config),
    "monero-lws": createMoneroLwsService(config, ctx),
    moneropay: createMoneroPayService(config),
  };
}
