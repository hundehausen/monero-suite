"use client";

import { useEffect } from "react";
import { parseAsStringEnum, useQueryState } from "nuqs";

import {
  ServiceMap,
  Architecture,
  NetworkMode,
  architectures,
  networkModes,
  p2poolModes,
  useMonerodService,
  useMonerodStagenetService,
  useP2PoolService,
  useMoneroWalletRpcService,
  useTorService,
  useWatchtowerService,
  useMonitoringService,
  useXmrigService,
  useTraefikService,
  usePortainerService,
  useCuprateService,
  CERT_RESOLVER_NAME,
} from "./services";
import { getZmqPubPort } from "@/lib/service-generators/monerod";
import { MONEROD_PORTS } from "@/lib/constants";
import { nextGrafanaDomain } from "@/lib/grafana-domain";

export * from "./services";

export const useServices = () => {
  const [architecture, setArchitecture] = useQueryState<Architecture>(
    "architecture",
    parseAsStringEnum(Object.values(architectures)).withDefault(
      architectures.linuxAmd
    )
  );
  const [networkMode, setNetworkMode] = useQueryState<NetworkMode>(
    "networkMode",
    parseAsStringEnum(Object.values(networkModes)).withDefault(
      networkModes.local
    )
  );

  // Initialize all service hooks
  const monerodService = useMonerodService();
  const monerodStagenetService = useMonerodStagenetService();
  const p2PoolService = useP2PoolService();
  const moneroWalletRpcService = useMoneroWalletRpcService();
  const torService = useTorService({ networkMode });
  const watchtowerService = useWatchtowerService();
  const monitoringService = useMonitoringService();
  const xmrigService = useXmrigService();
  const traefikService = useTraefikService();
  const portainerService = usePortainerService();
  const cuprateService = useCuprateService();

  // Extract state functions from each service
  const {
    isTraefik,
    isTraefikMonerod,
    isTraefikStagenet,
    isTraefikGrafana,
    isTraefikPortainer,
  } = traefikService.stateFunctions;
  const { isMonitoring, grafanaDomain, setGrafanaDomain } = monitoringService.stateFunctions;
  const { p2PoolMode } = p2PoolService.stateFunctions;
  const { miningMode, setMiningMode } = xmrigService.stateFunctions;
  const { isPrunedNode, isSyncPrunedBlocks } = monerodService.stateFunctions;

  // Sync Grafana domain with Traefik: local default when off, prefill
  // monitor.example.com when enabling Traefik on a localhost domain.
  useEffect(() => {
    const next = nextGrafanaDomain(isTraefik, isTraefikGrafana, grafanaDomain);
    if (next !== null) {
      setGrafanaDomain(next);
    }
  }, [isTraefik, isTraefikGrafana, grafanaDomain, setGrafanaDomain]);

  // Mining requires P2Pool (xmrig pools into p2pool, p2pool mode mines via
  // the p2pool service). Reset mining mode when P2Pool is turned off so a
  // stale xmrig/p2pool mining selection isn't silently kept in the config.
  useEffect(() => {
    if (p2PoolMode === "none" && miningMode !== "none") {
      setMiningMode("none");
    }
  }, [p2PoolMode, miningMode, setMiningMode]);

  // Should remove sync-pruned-blocks flag, if user switches from pruned node to full node
  useEffect(() => {
    if (!isPrunedNode && isSyncPrunedBlocks)
      monerodService.stateFunctions.setIsSyncPrunedBlocks(false);
  }, [isPrunedNode, isSyncPrunedBlocks, monerodService.stateFunctions]);

  // The port monerod actually binds ZMQ on — consumers must follow it.
  const zmqPubPort =
    getZmqPubPort(
      monerodService.stateFunctions.zmqPubEnabled,
      monerodService.stateFunctions.zmqPubBindPort,
      p2PoolMode !== p2poolModes.none || isMonitoring
    ) ?? MONEROD_PORTS.zmqPub;

  const services: ServiceMap = {
    monerod: monerodService.getMonerodService(
      networkMode,
      p2PoolService.stateFunctions.p2PoolMode,
      torService.stateFunctions.torProxyMode,
      isMonitoring,
      torService.stateFunctions.isHiddenServices,
      isTraefik && isTraefikMonerod,
      CERT_RESOLVER_NAME
    ),
    "monerod-stagenet": monerodStagenetService.getMonerodStagenetService(
      networkMode,
      isTraefik && isTraefikStagenet,
      CERT_RESOLVER_NAME,
      torService.stateFunctions.torProxyMode
    ),
    p2pool: p2PoolService.getP2PoolService(
      networkMode,
      xmrigService.stateFunctions.miningMode,
      torService.stateFunctions.torProxyMode,
      zmqPubPort
    ),
    "monero-wallet-rpc": moneroWalletRpcService.getMoneroWalletRpcService(
      networkMode,
      torService.stateFunctions.torProxyMode
    ),
    tor: torService.getTorService(
      networkMode,
      monerodStagenetService.stateFunctions.isStagenetNode,
      p2PoolService.stateFunctions.p2PoolMode,
      isMonitoring
    ),
    watchtower: watchtowerService.getWatchtowerService(),
    monitoring: monitoringService.getMonitoringService(
      networkMode,
      isTraefik && isTraefikGrafana,
      zmqPubPort,
      CERT_RESOLVER_NAME,
      torService.stateFunctions.torProxyMode
    ),
    xmrig: xmrigService.getXmrigService(
      torService.stateFunctions.torProxyMode,
      p2PoolService.stateFunctions.p2PoolMode
    ),
    traefik: traefikService.getTraefikService(
      torService.stateFunctions.torProxyMode
    ),
    portainer: portainerService.getPortainerService(
      networkMode,
      isTraefik && isTraefikPortainer,
      CERT_RESOLVER_NAME
    ),
    cuprate: cuprateService.getCuprateService(
      networkMode
    ),
  };

  const filteredServices: ServiceMap = Object.fromEntries(
    Object.entries(services).filter(([, service]) =>
      service.architecture?.includes(architecture)
    )
  );

  // Combine all state functions from all services
  const stateFunctions = {
    architecture,
    setArchitecture,
    networkMode,
    setNetworkMode,
    ...monerodService.stateFunctions,
    ...monerodStagenetService.stateFunctions,
    ...p2PoolService.stateFunctions,
    ...moneroWalletRpcService.stateFunctions,
    ...torService.stateFunctions,
    ...watchtowerService.stateFunctions,
    ...monitoringService.stateFunctions,
    ...xmrigService.stateFunctions,
    ...traefikService.stateFunctions,
    ...portainerService.stateFunctions,
    ...cuprateService.stateFunctions,
  };

  return {
    services: filteredServices,
    stateFunctions,
  };
};
