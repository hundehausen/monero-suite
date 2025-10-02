import { NetworkMode, P2PoolMode, TorProxyMode } from "./types";
import {
  useBasicConfig,
  useLoggingConfig,
  useP2PNetworkConfig,
  useTorI2PConfig,
  useNetworkSecurityConfig,
  useNetworkPeersConfig,
  usePerformanceConfig,
  useZmqRpcConfig,
  useTxPoolConfig,
  useMiningConfig,
  useNotificationsConfig,
  createMonerodService,
  MonerodServiceHook
} from "./monerod/index";

/**
 * Hook for Monero daemon service configuration
 * This combines all the individual configuration hooks into a single service
 */
export const useMonerodService = (): MonerodServiceHook => {
  // Import all the configuration hooks
  const basicConfig = useBasicConfig();
  const loggingConfig = useLoggingConfig();
  const p2pNetworkConfig = useP2PNetworkConfig();
  const torI2PConfig = useTorI2PConfig();
  const networkSecurityConfig = useNetworkSecurityConfig();
  const networkPeersConfig = useNetworkPeersConfig();
  const performanceConfig = usePerformanceConfig();
  const zmqRpcConfig = useZmqRpcConfig();
  const txPoolConfig = useTxPoolConfig();
  const miningConfig = useMiningConfig();
  const notificationsConfig = useNotificationsConfig();

  // Combine all state functions
  const stateFunctions = {
    ...basicConfig,
    ...loggingConfig,
    ...p2pNetworkConfig,
    ...torI2PConfig,
    ...networkSecurityConfig,
    ...networkPeersConfig,
    ...performanceConfig,
    ...zmqRpcConfig,
    ...txPoolConfig,
    ...miningConfig,
    ...notificationsConfig,
  };

  /**
   * Generate the Monero daemon service configuration
   */
  const getMonerodService = (
    networkMode: NetworkMode,
    p2PoolMode: P2PoolMode,
    torProxyMode: TorProxyMode,
    isMonitoring: boolean,
    isHiddenServices: boolean,
    isTraefik: boolean,
    certResolverName: string = "monerosuite"
  ) => {
    return createMonerodService(
      stateFunctions,
      networkMode,
      p2PoolMode,
      torProxyMode,
      isMonitoring,
      isHiddenServices,
      isTraefik,
      certResolverName
    );
  };

  return {
    getMonerodService,
    stateFunctions,
  };
};
