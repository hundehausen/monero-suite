import { useEffect, useMemo } from "react";
import { parseAsStringEnum, useQueryState } from "nuqs";

import {
  ServiceMap,
  Architecture,
  NetworkMode,
  architectures,
  networkModes,
  useMonerodService,
  useMonerodStagenetService,
  useP2PoolService,
  useMoneroWalletRpcService,
  useMoneroblockService,
  useOnionMoneroBlockchainExplorerService,
  useTorProxyService,
  useTorHiddenServiceService,
  useWatchtowerService,
  useMonitoringService,
  useAutohealService,
  useXmrigService,
  useTraefikService,
  usePortainerService,
} from "./services";

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
  const moneroblockService = useMoneroblockService();
  const onionMoneroBlockchainExplorerService =
    useOnionMoneroBlockchainExplorerService();
  const torProxyService = useTorProxyService();
  const torHiddenServiceService = useTorHiddenServiceService();
  const watchtowerService = useWatchtowerService();
  const monitoringService = useMonitoringService();
  const autohealService = useAutohealService();
  const xmrigService = useXmrigService();
  const traefikService = useTraefikService();
  const portainerService = usePortainerService();

  // Extract state functions from each service
  const { isTraefik } = traefikService.stateFunctions;
  const { isMonitoring, setGrafanaDomain } = monitoringService.stateFunctions;
  const { isPrunedNode, isSyncPrunedBlocks } = monerodService.stateFunctions;

  useEffect(() => {
    if (isTraefik) {
      setGrafanaDomain("grafana.monerosuite.org");
    } else {
      setGrafanaDomain("localhost:3000");
    }
  }, [isTraefik, setGrafanaDomain]);

  useEffect(() => {
    if (!isPrunedNode)
      isSyncPrunedBlocks &&
        monerodService.stateFunctions.setIsSyncPrunedBlocks(false);
  }, [isPrunedNode, isSyncPrunedBlocks, monerodService.stateFunctions]);

  const services = useMemo<ServiceMap>(
    () => ({
      monerod: monerodService.getMonerodService(
        networkMode,
        p2PoolService.stateFunctions.p2PoolMode,
        torProxyService.stateFunctions.torProxyMode,
        isMonitoring,
        torHiddenServiceService.stateFunctions.isHiddenServices,
        isTraefik
      ),
      "monerod-stagenet": monerodStagenetService.getMonerodStagenetService(
        networkMode,
        isTraefik
      ),
      p2pool: p2PoolService.getP2PoolService(
        networkMode,
        xmrigService.stateFunctions.miningMode,
        torProxyService.stateFunctions.torProxyMode
      ),
      "monero-wallet-rpc":
        moneroWalletRpcService.getMoneroWalletRpcService(networkMode),
      moneroblock: moneroblockService.getMoneroblockService(
        networkMode,
        isTraefik
      ),
      "onion-monero-blockchain-explorer":
        onionMoneroBlockchainExplorerService.getOnionMoneroBlockchainExplorerService(
          networkMode,
          isTraefik
        ),
      "tor-proxy": torProxyService.getTorProxyService(networkMode),
      "tor-hidden-service": torHiddenServiceService.getTorHiddenServiceService(
        monerodStagenetService.stateFunctions.isStagenetNode,
        p2PoolService.stateFunctions.p2PoolMode,
        moneroblockService.stateFunctions.isMoneroblock,
        onionMoneroBlockchainExplorerService.stateFunctions
          .isOnionMoneroBlockchainExplorer,
        isMonitoring
      ),
      watchtower: watchtowerService.getWatchtowerService(),
      monitoring: monitoringService.getMonitoringService(
        networkMode,
        isTraefik
      ),
      autoheal: autohealService.getAutohealService(),
      xmrig: xmrigService.getXmrigService(),
      traefik: traefikService.getTraefikService(),
      portainer: portainerService.getPortainerService(networkMode, isTraefik),
    }),
    [
      networkMode,
      monerodService,
      monerodStagenetService,
      p2PoolService,
      moneroWalletRpcService,
      moneroblockService,
      onionMoneroBlockchainExplorerService,
      torProxyService,
      torHiddenServiceService,
      watchtowerService,
      monitoringService,
      autohealService,
      xmrigService,
      traefikService,
      portainerService,
      isMonitoring,
      isTraefik,
    ]
  );

  const filteredServices = useMemo<ServiceMap>(
    () =>
      Object.fromEntries(
        Object.entries(services).filter(([, service]) =>
          service.architecture?.includes(architecture)
        )
      ),
    [architecture, services]
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
    ...moneroblockService.stateFunctions,
    ...onionMoneroBlockchainExplorerService.stateFunctions,
    ...torProxyService.stateFunctions,
    ...torHiddenServiceService.stateFunctions,
    ...watchtowerService.stateFunctions,
    ...monitoringService.stateFunctions,
    ...autohealService.stateFunctions,
    ...xmrigService.stateFunctions,
    ...traefikService.stateFunctions,
    ...portainerService.stateFunctions,
  };

  return {
    services: filteredServices,
    stateFunctions,
  };
};
