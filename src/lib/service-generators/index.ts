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
import { createTraefikService } from "./traefik";
import { createPortainerService } from "./portainer";
import { createCuprateService } from "./cuprate";
import { createMonerodFcmpStressnetService } from "./monerod-fcmp-stressnet";
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
    anyHiddenService: anyHiddenService(config.tor, config.p2pool.p2PoolMode),
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
    xmrig: createXmrigService(config),
    traefik: createTraefikService(config),
    portainer: createPortainerService(config),
    cuprate: createCuprateService(config),
    "monerod-fcmp-stressnet": createMonerodFcmpStressnetService(config),
    "monero-lws": createMoneroLwsService(config, ctx),
    moneropay: createMoneroPayService(config),
  };
}
