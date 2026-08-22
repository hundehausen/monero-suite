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
  MonerodServiceHook
} from "./monerod/index";

export const useMonerodService = (): MonerodServiceHook => {
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

  return {
    stateFunctions,
  };
};
