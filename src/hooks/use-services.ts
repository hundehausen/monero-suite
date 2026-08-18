"use client";

import { useEffect } from "react";
import { parseAsStringEnum, useQueryState } from "nuqs";

import {
  Architecture,
  NetworkMode,
  architectures,
  networkModes,
  useMonerodService,
  useMonerodStagenetService,
  useP2PoolService,
  useMoneroWalletRpcService,
  useTorService,
  useWatchtowerService,
  useMonitoringService,
  useXmrigService,
  useXmrigProxyService,
  useTraefikService,
  usePortainerService,
  useCuprateService,
  useMoneroLwsService,
  useMoneroPayService,
} from "./services";
import { nextGrafanaDomain } from "@/lib/grafana-domain";
import { toFullConfig } from "@/lib/to-full-config";
import {
  filterServicesByArchitecture,
  generateAllServices,
} from "@/lib/service-generators";

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

  const monerodService = useMonerodService();
  const monerodStagenetService = useMonerodStagenetService();
  const p2PoolService = useP2PoolService();
  const moneroWalletRpcService = useMoneroWalletRpcService();
  const torService = useTorService({ networkMode });
  const watchtowerService = useWatchtowerService();
  const monitoringService = useMonitoringService();
  const xmrigService = useXmrigService();
  const xmrigProxyService = useXmrigProxyService();
  const traefikService = useTraefikService();
  const portainerService = usePortainerService();
  const cuprateService = useCuprateService();
  const moneroLwsService = useMoneroLwsService();
  const moneroPayService = useMoneroPayService();

  const { isTraefik, isTraefikGrafana } = traefikService.stateFunctions;
  const { grafanaDomain, setGrafanaDomain } = monitoringService.stateFunctions;
  const { p2PoolMode } = p2PoolService.stateFunctions;
  const { miningMode, setMiningMode } = xmrigService.stateFunctions;
  const {
    isXmrigProxy,
    setIsXmrigProxy,
    isXmrigProxyPublic,
    setIsXmrigProxyPublic,
  } = xmrigProxyService.stateFunctions;
  const { hsXmrigProxy, setHsXmrigProxy } = torService.stateFunctions;
  const { isPrunedNode, isSyncPrunedBlocks } = monerodService.stateFunctions;
  const { isMoneroPay } = moneroPayService.stateFunctions;
  const { isMoneroWalletRpc, setIsMoneroWalletRpc } = moneroWalletRpcService.stateFunctions;

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

  // Proxy requires P2Pool (it upstreams to p2pool stratum) and amd64
  // images. Reset the toggle plus public/HS flags so a stale selection
  // cannot publish ports or point Tor at a container that was filtered out.
  useEffect(() => {
    if (p2PoolMode !== "none") return;
    if (isXmrigProxy) setIsXmrigProxy(false);
    if (isXmrigProxyPublic) setIsXmrigProxyPublic(false);
    if (hsXmrigProxy) setHsXmrigProxy(false);
  }, [
    p2PoolMode,
    isXmrigProxy,
    isXmrigProxyPublic,
    hsXmrigProxy,
    setIsXmrigProxy,
    setIsXmrigProxyPublic,
    setHsXmrigProxy,
  ]);

  useEffect(() => {
    if (architecture === architectures.linuxAmd) return;
    if (isXmrigProxy) setIsXmrigProxy(false);
    if (isXmrigProxyPublic) setIsXmrigProxyPublic(false);
    if (hsXmrigProxy) setHsXmrigProxy(false);
  }, [
    architecture,
    isXmrigProxy,
    isXmrigProxyPublic,
    hsXmrigProxy,
    setIsXmrigProxy,
    setIsXmrigProxyPublic,
    setHsXmrigProxy,
  ]);

  // Should remove sync-pruned-blocks flag, if user switches from pruned node to full node
  useEffect(() => {
    if (!isPrunedNode && isSyncPrunedBlocks)
      monerodService.stateFunctions.setIsSyncPrunedBlocks(false);
  }, [isPrunedNode, isSyncPrunedBlocks, monerodService.stateFunctions]);

  // MoneroPay talks to wallet-rpc. Keep wallet-rpc on whenever pay is enabled,
  // including if the user tries to turn wallet-rpc off while pay is still on.
  useEffect(() => {
    if (isMoneroPay && !isMoneroWalletRpc) {
      setIsMoneroWalletRpc(true);
    }
  }, [isMoneroPay, isMoneroWalletRpc, setIsMoneroWalletRpc]);

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
    ...xmrigProxyService.stateFunctions,
    ...traefikService.stateFunctions,
    ...portainerService.stateFunctions,
    ...cuprateService.stateFunctions,
    ...moneroLwsService.stateFunctions,
    ...moneroPayService.stateFunctions,
  };

  const services = filterServicesByArchitecture(
    generateAllServices(toFullConfig(stateFunctions)),
    architecture
  );

  return {
    services,
    stateFunctions,
  };
};
