"use client";

import { useEffect } from "react";
import { parseAsBoolean, parseAsStringEnum, useQueryState } from "nuqs";

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
  useTraefikService,
  usePortainerService,
  useCuprateService,
  useFcmpStressnetService,
  useMoneroLwsService,
  useMoneroPayService,
} from "./services";
import { nextGrafanaDomain } from "@/lib/grafana-domain";
import {
  monerodConfigSchema,
  stagenetConfigSchema,
  p2poolConfigSchema,
  miningConfigSchema,
  torConfigSchema,
  serviceToggleSchema,
  type FullConfig,
} from "@/lib/config-schema";
import { pickConfigGroup } from "@/lib/pick-config-group";
import {
  filterServicesByArchitecture,
  generateAllServices,
} from "@/lib/service-generators";
import { useStripSecretQueryParams } from "./use-secret-state";

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
  const [upgradeSystemPackages, setUpgradeSystemPackages] = useQueryState(
    "upgradeSystemPackages",
    parseAsBoolean.withDefault(false)
  );

  useStripSecretQueryParams();

  const monerodService = useMonerodService();
  const monerodStagenetService = useMonerodStagenetService();
  const p2PoolService = useP2PoolService();
  const moneroWalletRpcService = useMoneroWalletRpcService();
  const torService = useTorService({
    networkMode,
    p2PoolMode: p2PoolService.stateFunctions.p2PoolMode,
  });
  const watchtowerService = useWatchtowerService();
  const monitoringService = useMonitoringService();
  const xmrigService = useXmrigService();
  const traefikService = useTraefikService();
  const portainerService = usePortainerService();
  const cuprateService = useCuprateService();
  const fcmpStressnetService = useFcmpStressnetService();
  const moneroLwsService = useMoneroLwsService();
  const moneroPayService = useMoneroPayService();

  const { isTraefik, isTraefikGrafana } = traefikService.stateFunctions;
  const { grafanaDomain, setGrafanaDomain } = monitoringService.stateFunctions;
  const { p2PoolMode } = p2PoolService.stateFunctions;
  const { miningMode, setMiningMode } = xmrigService.stateFunctions;
  const { hsP2Pool, setHsP2Pool } = torService.stateFunctions;
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

  // The P2Pool onion checkbox is hidden while P2Pool is off. Drop the flag
  // too, or it keeps Tor enabled and monerod gets --disable-rpc-ban with no
  // control left to turn it off.
  useEffect(() => {
    if (p2PoolMode === "none" && hsP2Pool) {
      setHsP2Pool(false);
    }
  }, [p2PoolMode, hsP2Pool, setHsP2Pool]);

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
    upgradeSystemPackages,
    setUpgradeSystemPackages,
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
    ...fcmpStressnetService.stateFunctions,
    ...moneroLwsService.stateFunctions,
    ...moneroPayService.stateFunctions,
  };

  const config = {
    architecture,
    networkMode,
    upgradeSystemPackages,
    monerod: pickConfigGroup(monerodService.stateFunctions, monerodConfigSchema),
    stagenet: pickConfigGroup(monerodStagenetService.stateFunctions, stagenetConfigSchema),
    p2pool: pickConfigGroup(p2PoolService.stateFunctions, p2poolConfigSchema),
    mining: pickConfigGroup(xmrigService.stateFunctions, miningConfigSchema),
    tor: pickConfigGroup(torService.stateFunctions, torConfigSchema),
    services: pickConfigGroup(
      {
        ...moneroWalletRpcService.stateFunctions,
        ...watchtowerService.stateFunctions,
        ...monitoringService.stateFunctions,
        ...traefikService.stateFunctions,
        ...portainerService.stateFunctions,
        ...cuprateService.stateFunctions,
        ...fcmpStressnetService.stateFunctions,
        ...moneroLwsService.stateFunctions,
        ...moneroPayService.stateFunctions,
      },
      serviceToggleSchema
    ),
  } satisfies FullConfig;

  const services = filterServicesByArchitecture(
    generateAllServices(config),
    architecture
  );

  return {
    services,
    config,
    stateFunctions,
  };
};
