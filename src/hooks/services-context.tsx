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
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useP2PoolState(): P2PoolState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useMoneroWalletRpcState(): MoneroWalletRpcState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useMoneroblockState(): MoneroblockState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useOnionExplorerState(): OnionExplorerState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useTorState(): TorState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useWatchtowerState(): WatchtowerState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useMonitoringState(): MonitoringState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useAutohealState(): AutohealState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useXmrigState(): XmrigState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useTraefikState(): TraefikState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function usePortainerState(): PortainerState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}

export function useCuprateState(): CuprateState {
  const { stateFunctions } = useServicesContext();
  return stateFunctions;
}
