"use client";

import { createContext, useContext, ReactNode } from "react";
import { useServices } from "./use-services";
import {
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

// Derive state types from each service hook
export type MonerodState = ReturnType<typeof useMonerodService>["stateFunctions"];
export type StagenetState = ReturnType<typeof useMonerodStagenetService>["stateFunctions"];
export type P2PoolState = ReturnType<typeof useP2PoolService>["stateFunctions"];
export type MoneroWalletRpcState = ReturnType<typeof useMoneroWalletRpcService>["stateFunctions"];
export type MoneroblockState = ReturnType<typeof useMoneroblockService>["stateFunctions"];
export type OnionExplorerState = ReturnType<typeof useOnionMoneroBlockchainExplorerService>["stateFunctions"];
export type TorState = ReturnType<typeof useTorService>["stateFunctions"];
export type WatchtowerState = ReturnType<typeof useWatchtowerService>["stateFunctions"];
export type MonitoringState = ReturnType<typeof useMonitoringService>["stateFunctions"];
export type AutohealState = ReturnType<typeof useAutohealService>["stateFunctions"];
export type XmrigState = ReturnType<typeof useXmrigService>["stateFunctions"];
export type TraefikState = ReturnType<typeof useTraefikService>["stateFunctions"];
export type PortainerState = ReturnType<typeof usePortainerService>["stateFunctions"];
export type CuprateState = ReturnType<typeof useCuprateService>["stateFunctions"];

// Full context type derived from useServices
export type ServicesContextType = ReturnType<typeof useServices>;

const ServicesContext = createContext<ServicesContextType | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const value = useServices();
  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServicesContext(): ServicesContextType {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("useServicesContext must be used within ServicesProvider");
  return ctx;
}

// Typed selector hooks — each returns only the state slice for its service.
// Uses TypeScript structural typing: the full stateFunctions object satisfies
// the narrower return type, so autocomplete only shows relevant properties.

export function useArchitectureState() {
  const { stateFunctions: s } = useServicesContext();
  return { architecture: s.architecture, setArchitecture: s.setArchitecture };
}

export function useNetworkModeState() {
  const { stateFunctions: s } = useServicesContext();
  return { networkMode: s.networkMode, setNetworkMode: s.setNetworkMode };
}

export function useMonerodState(): MonerodState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useStagenetState(): StagenetState {
  const { stateFunctions: s } = useServicesContext();
  return {
    isStagenetNode: s.isStagenetNode, setIsStagenetNode: s.setIsStagenetNode,
    isStagenetNodePublic: s.isStagenetNodePublic, setIsStagenetNodePublic: s.setIsStagenetNodePublic,
    isMoneroStagenetCustomLocation: s.isMoneroStagenetCustomLocation, setIsMoneroStagenetCustomLocation: s.setIsMoneroStagenetCustomLocation,
    moneroStagenetBlockchainLocation: s.moneroStagenetBlockchainLocation, setMoneroStagenetBlockchainLocation: s.setMoneroStagenetBlockchainLocation,
    stagenetNodeDomain: s.stagenetNodeDomain, setStagenetNodeDomain: s.setStagenetNodeDomain,
  };
}

export function useP2PoolState(): P2PoolState {
  const { stateFunctions: s } = useServicesContext();
  return {
    p2PoolMode: s.p2PoolMode, setP2PoolMode: s.setP2PoolMode,
    p2PoolPayoutAddress: s.p2PoolPayoutAddress, setP2PoolPayoutAddress: s.setP2PoolPayoutAddress,
    p2PoolMiningThreads: s.p2PoolMiningThreads, setP2PoolMiningThreads: s.setP2PoolMiningThreads,
  };
}

export function useMoneroWalletRpcState(): MoneroWalletRpcState {
  const { stateFunctions: s } = useServicesContext();
  return { isMoneroWalletRpc: s.isMoneroWalletRpc, setIsMoneroWalletRpc: s.setIsMoneroWalletRpc };
}

export function useMoneroblockState(): MoneroblockState {
  const { stateFunctions: s } = useServicesContext();
  return {
    isMoneroblock: s.isMoneroblock, setIsMoneroblock: s.setIsMoneroblock,
    isMoneroblockLoggingDisabled: s.isMoneroblockLoggingDisabled, setIsMoneroblockLoggingDisabled: s.setIsMoneroblockLoggingDisabled,
    moneroBlockDomain: s.moneroBlockDomain, setMoneroBlockDomain: s.setMoneroBlockDomain,
  };
}

export function useOnionExplorerState(): OnionExplorerState {
  const { stateFunctions: s } = useServicesContext();
  return {
    isOnionMoneroBlockchainExplorer: s.isOnionMoneroBlockchainExplorer, setIsOnionMoneroBlockchainExplorer: s.setIsOnionMoneroBlockchainExplorer,
    onionMoneroBlockchainExplorerDomain: s.onionMoneroBlockchainExplorerDomain, setOnionMoneroBlockchainExplorerDomain: s.setOnionMoneroBlockchainExplorerDomain,
  };
}

export function useTorState(): TorState {
  const { stateFunctions: s } = useServicesContext();
  return {
    torProxyMode: s.torProxyMode, setTorProxyMode: s.setTorProxyMode,
    isHiddenServices: s.isHiddenServices,
    hsMonerod: s.hsMonerod, setHsMonerod: s.setHsMonerod,
    hsMonerodP2P: s.hsMonerodP2P, setHsMonerodP2P: s.setHsMonerodP2P,
    hsStagenet: s.hsStagenet, setHsStagenet: s.setHsStagenet,
    hsP2Pool: s.hsP2Pool, setHsP2Pool: s.setHsP2Pool,
    hsMoneroblock: s.hsMoneroblock, setHsMoneroblock: s.setHsMoneroblock,
    hsOnionExplorer: s.hsOnionExplorer, setHsOnionExplorer: s.setHsOnionExplorer,
    hsGrafana: s.hsGrafana, setHsGrafana: s.setHsGrafana,
    isGlobalTorProxy: s.isGlobalTorProxy, setIsGlobalTorProxy: s.setIsGlobalTorProxy,
  };
}

export function useWatchtowerState(): WatchtowerState {
  const { stateFunctions: s } = useServicesContext();
  return { isWatchtower: s.isWatchtower, setIsWatchtower: s.setIsWatchtower };
}

export function useMonitoringState(): MonitoringState {
  const { stateFunctions: s } = useServicesContext();
  return {
    isMonitoring: s.isMonitoring, setIsMonitoring: s.setIsMonitoring,
    grafanaDomain: s.grafanaDomain, setGrafanaDomain: s.setGrafanaDomain,
  };
}

export function useAutohealState(): AutohealState {
  const { stateFunctions: s } = useServicesContext();
  return { isAutoheal: s.isAutoheal, setIsAutoheal: s.setIsAutoheal };
}

export function useXmrigState(): XmrigState {
  const { stateFunctions: s } = useServicesContext();
  return {
    miningMode: s.miningMode, setMiningMode: s.setMiningMode,
    xmrigDonateLevel: s.xmrigDonateLevel, setXmrigDonateLevel: s.setXmrigDonateLevel,
  };
}

export function useTraefikState(): TraefikState {
  const { stateFunctions: s } = useServicesContext();
  return {
    isTraefik: s.isTraefik, setIsTraefik: s.setIsTraefik,
    isTraefikMonerod: s.isTraefikMonerod, setIsTraefikMonerod: s.setIsTraefikMonerod,
    isTraefikStagenet: s.isTraefikStagenet, setIsTraefikStagenet: s.setIsTraefikStagenet,
    isTraefikMoneroblock: s.isTraefikMoneroblock, setIsTraefikMoneroblock: s.setIsTraefikMoneroblock,
    isTraefikOnionExplorer: s.isTraefikOnionExplorer, setIsTraefikOnionExplorer: s.setIsTraefikOnionExplorer,
    isTraefikGrafana: s.isTraefikGrafana, setIsTraefikGrafana: s.setIsTraefikGrafana,
    isTraefikPortainer: s.isTraefikPortainer, setIsTraefikPortainer: s.setIsTraefikPortainer,
  };
}

export function usePortainerState(): PortainerState {
  const { stateFunctions: s } = useServicesContext();
  return {
    isPortainer: s.isPortainer, setIsPortainer: s.setIsPortainer,
    portainerDomain: s.portainerDomain, setPortainerDomain: s.setPortainerDomain,
  };
}

export function useCuprateState(): CuprateState {
  const { stateFunctions: s } = useServicesContext();
  return { isCuprateEnabled: s.isCuprateEnabled, setIsCuprateEnabled: s.setIsCuprateEnabled };
}
