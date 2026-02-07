import { useEffect } from "react";
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
  useTorService,
  useWatchtowerService,
  useMonitoringService,
  useAutohealService,
  useXmrigService,
  useTraefikService,
  usePortainerService,
  useCuprateService,
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
  const torService = useTorService({ networkMode });
  const watchtowerService = useWatchtowerService();
  const monitoringService = useMonitoringService();
  const autohealService = useAutohealService();
  const xmrigService = useXmrigService();
  const traefikService = useTraefikService();
  const portainerService = usePortainerService();
  const cuprateService = useCuprateService();

  // Extract state functions from each service
  const { isTraefik, mainDomain } = traefikService.stateFunctions;
  const { isMonitoring, setGrafanaDomain } = monitoringService.stateFunctions;
  const { isPrunedNode, isSyncPrunedBlocks } = monerodService.stateFunctions;
  const { setMoneroBlockDomain } = moneroblockService.stateFunctions;
  const { setStagenetNodeDomain } = monerodStagenetService.stateFunctions;
  const { setMoneroNodeDomain } = monerodService.stateFunctions;
  const { setPortainerDomain } = portainerService.stateFunctions;

  // Get the certificate resolver name
  const certResolverName = traefikService.getCertResolverName();

  useEffect(() => {
    if (isTraefik) {
      setGrafanaDomain(`grafana.${mainDomain}`);
      setMoneroBlockDomain(`explorer.${mainDomain}`);
      setStagenetNodeDomain(`stagenet.${mainDomain}`);
      setMoneroNodeDomain(`node.${mainDomain}`);
      setPortainerDomain(`portainer.${mainDomain}`);
    } else {
      setGrafanaDomain("localhost:3000");
    }
  }, [
    isTraefik,
    mainDomain,
    setGrafanaDomain,
    setMoneroBlockDomain,
    setStagenetNodeDomain,
    setMoneroNodeDomain,
    setPortainerDomain,
  ]);

  useEffect(() => {
    if (!isPrunedNode)
      isSyncPrunedBlocks &&
        monerodService.stateFunctions.setIsSyncPrunedBlocks(false);
  }, [isPrunedNode, isSyncPrunedBlocks, monerodService.stateFunctions]);

  const services: ServiceMap = {
    monerod: monerodService.getMonerodService(
      networkMode,
      p2PoolService.stateFunctions.p2PoolMode,
      torService.stateFunctions.torProxyMode,
      isMonitoring,
      torService.stateFunctions.isHiddenServices,
      isTraefik,
      certResolverName
    ),
    "monerod-stagenet": monerodStagenetService.getMonerodStagenetService(
      networkMode,
      isTraefik,
      certResolverName,
      torService.stateFunctions.torProxyMode
    ),
    p2pool: p2PoolService.getP2PoolService(
      networkMode,
      xmrigService.stateFunctions.miningMode,
      torService.stateFunctions.torProxyMode
    ),
    "monero-wallet-rpc":
      moneroWalletRpcService.getMoneroWalletRpcService(networkMode),
    moneroblock: moneroblockService.getMoneroblockService(
      networkMode,
      isTraefik,
      certResolverName,
      torService.stateFunctions.torProxyMode
    ),
    "onion-monero-blockchain-explorer":
      onionMoneroBlockchainExplorerService.getOnionMoneroBlockchainExplorerService(
        networkMode,
        isTraefik,
        certResolverName,
        torService.stateFunctions.torProxyMode
      ),
    tor: torService.getTorService(
      networkMode,
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
      isTraefik,
      certResolverName,
      torService.stateFunctions.torProxyMode
    ),
    autoheal: autohealService.getAutohealService(),
    xmrig: xmrigService.getXmrigService(),
    traefik: traefikService.getTraefikService(),
    portainer: portainerService.getPortainerService(
      networkMode,
      isTraefik,
      certResolverName
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
    ...moneroblockService.stateFunctions,
    ...onionMoneroBlockchainExplorerService.stateFunctions,
    ...torService.stateFunctions,
    ...watchtowerService.stateFunctions,
    ...monitoringService.stateFunctions,
    ...autohealService.stateFunctions,
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
