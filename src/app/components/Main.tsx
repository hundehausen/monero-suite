"use client";

import ComposePreview from "./ComposePreview";
import Selection from "./Selection";
import { Card, Grid, Tabs } from "@mantine/core";
import BashPreview from "./BashPreview";
import EnvPreview from "./EnvPreview";
import { FaDocker, FaLinux } from "react-icons/fa";
import { SiDotenv, SiGnubash } from "react-icons/si";
import { useServicesContext, useHasDefaultDomain } from "@/hooks/services-context";
import { networkModes } from "@/hooks/use-services";
import { useState, useMemo } from "react";
import {
  generateDockerComposeFile,
  generateBashScriptFile,
  generateEnvFile,
  getFirewallPorts,
  generateScriptSummary,
} from "../utils";
import { generateInstallationScript } from "@/lib/script-generator";
import { stringify } from "yaml";
import { useInstallScript } from "@/hooks/use-install-script";
import InstallScriptPanel from "./InstallScriptPanel";
import type { FullConfig } from "@/lib/config-schema";
import { getMonerodP2pPortCollisions, getMonerodZmqPortCollisions } from "@/lib/service-generators/monerod";
import { isValidP2PoolPayoutAddress } from "@/lib/schemas";

export default function Main() {
  const { services, stateFunctions } = useServicesContext();
  const [activeTab, setActiveTab] = useState<string | null>("docker-compose");

  const checkedServices = useMemo(
    () => Object.values(services).filter(
      (service) => service.checked !== false && service.checked !== "none"
    ),
    [services]
  );

  const hasP2PoolInvalidAddress = useMemo(() => {
    if (stateFunctions.p2PoolMode === "none") return false;
    return !isValidP2PoolPayoutAddress(stateFunctions.p2PoolPayoutAddress);
  }, [stateFunctions.p2PoolMode, stateFunctions.p2PoolPayoutAddress]);

  const hasP2PPortCollision = useMemo(
    () =>
      getMonerodP2pPortCollisions(
        stateFunctions.p2pBindPort,
        stateFunctions.zmqPubEnabled,
        stateFunctions.zmqPubBindPort,
        stateFunctions.p2PoolMode,
        stateFunctions.isMonitoring,
        stateFunctions.isMoneroLws
      ).length > 0,
    [
      stateFunctions.p2pBindPort,
      stateFunctions.zmqPubEnabled,
      stateFunctions.zmqPubBindPort,
      stateFunctions.p2PoolMode,
      stateFunctions.isMonitoring,
      stateFunctions.isMoneroLws,
    ]
  );

  const hasZmqPortCollision = useMemo(
    () =>
      getMonerodZmqPortCollisions(
        stateFunctions.zmqPubEnabled,
        stateFunctions.zmqPubBindPort,
        stateFunctions.p2PoolMode,
        stateFunctions.isMonitoring,
        stateFunctions.p2pBindPort,
        stateFunctions.isMoneroLws
      ).length > 0,
    [
      stateFunctions.zmqPubEnabled,
      stateFunctions.zmqPubBindPort,
      stateFunctions.p2PoolMode,
      stateFunctions.isMonitoring,
      stateFunctions.p2pBindPort,
      stateFunctions.isMoneroLws,
    ]
  );

  const hasMonerodPortCollision = hasP2PPortCollision || hasZmqPortCollision;

  const hasDefaultDomain = useHasDefaultDomain();

  const dockerCompose = useMemo(() => generateDockerComposeFile(checkedServices), [checkedServices]);
  const bashCommands = useMemo(() => generateBashScriptFile(checkedServices), [checkedServices]);
  const hasBashCommands = useMemo(() => checkedServices.some((s) => s.bash), [checkedServices]);
  const envString = useMemo(() => generateEnvFile(checkedServices), [checkedServices]);
  const isExposed = stateFunctions.networkMode === networkModes.exposed;
  const firewallPorts = useMemo(() => getFirewallPorts(checkedServices), [checkedServices]);
  const dockerComposeYaml = useMemo(() => stringify(dockerCompose), [dockerCompose]);

  const fullScript = useMemo(
    () => generateInstallationScript(dockerComposeYaml, bashCommands, envString || undefined, isExposed, firewallPorts),
    [dockerComposeYaml, bashCommands, envString, isExposed, firewallPorts]
  );

  const scriptSummary = useMemo(
    () => generateScriptSummary(checkedServices, envString, isExposed, firewallPorts),
    [checkedServices, envString, isExposed, firewallPorts]
  );

  const enabledBashServices = useMemo(
    () => ({
      monitoring: checkedServices.some((s) => s.name === "Monitoring"),
      cuprate: checkedServices.some((s) => s.name === "Cuprate (Experimental)"),
    }),
    [checkedServices]
  );

  const config: FullConfig = useMemo(() => ({
    architecture: stateFunctions.architecture,
    networkMode: stateFunctions.networkMode,
    monerod: {
      isMoneroPublicNode: stateFunctions.isMoneroPublicNode,
      moneroNodeNoLogs: stateFunctions.moneroNodeNoLogs,
      moneroNodeDomain: stateFunctions.moneroNodeDomain,
      isPrunedNode: stateFunctions.isPrunedNode,
      isSyncPrunedBlocks: stateFunctions.isSyncPrunedBlocks,
      isMoneroMainnetVolume: stateFunctions.isMoneroMainnetVolume,
      moneroMainnetBlockchainLocation: stateFunctions.moneroMainnetBlockchainLocation,
      logLevel: stateFunctions.logLevel,
      maxLogFileSize: stateFunctions.maxLogFileSize,
      maxLogFiles: stateFunctions.maxLogFiles,
      p2pBindPort: stateFunctions.p2pBindPort,
      outPeers: stateFunctions.outPeers,
      inPeers: stateFunctions.inPeers,
      limitRateUp: stateFunctions.limitRateUp,
      limitRateDown: stateFunctions.limitRateDown,
      hidePort: stateFunctions.hidePort,
      allowLocalIp: stateFunctions.allowLocalIp,
      maxConnectionsPerIp: stateFunctions.maxConnectionsPerIp,
      p2pExternalPort: stateFunctions.p2pExternalPort,
      offlineMode: stateFunctions.offlineMode,
      padTransactions: stateFunctions.padTransactions,
      anonymousInbound: stateFunctions.anonymousInbound,
      txProxyDisableNoise: stateFunctions.txProxyDisableNoise,
      banList: stateFunctions.banList,
      enableDnsBlocklist: stateFunctions.enableDnsBlocklist,
      dnsCheckpoints: stateFunctions.dnsCheckpoints,
      seedNode: stateFunctions.seedNode,
      addPeer: stateFunctions.addPeer,
      addPriorityNode: stateFunctions.addPriorityNode,
      addExclusiveNode: stateFunctions.addExclusiveNode,
      dbSyncMode: stateFunctions.dbSyncMode,
      blockSyncSize: stateFunctions.blockSyncSize,
      fastBlockSync: stateFunctions.fastBlockSync,
      preparationThreads: stateFunctions.preparationThreads,
      maxConcurrency: stateFunctions.maxConcurrency,
      bootstrapDaemonAddress: stateFunctions.bootstrapDaemonAddress,
      bootstrapDaemonLogin: stateFunctions.bootstrapDaemonLogin,
      zmqPubEnabled: stateFunctions.zmqPubEnabled,
      zmqPubBindPort: stateFunctions.zmqPubBindPort,
      rpcLogin: stateFunctions.rpcLogin,
      disableRpcBan: stateFunctions.disableRpcBan,
      maxTxpoolWeight: stateFunctions.maxTxpoolWeight,
      startMining: stateFunctions.startMining,
      miningThreads: stateFunctions.miningThreads,
      bgMiningEnable: stateFunctions.bgMiningEnable,
      bgMiningIgnoreBattery: stateFunctions.bgMiningIgnoreBattery,
      blockNotify: stateFunctions.blockNotify,
      reorgNotify: stateFunctions.reorgNotify,
      blockRateNotify: stateFunctions.blockRateNotify,
    },
    stagenet: {
      isStagenetNode: stateFunctions.isStagenetNode,
      isStagenetNodePublic: stateFunctions.isStagenetNodePublic,
      isMoneroStagenetCustomLocation: stateFunctions.isMoneroStagenetCustomLocation,
      moneroStagenetBlockchainLocation: stateFunctions.moneroStagenetBlockchainLocation,
      stagenetNodeDomain: stateFunctions.stagenetNodeDomain,
    },
    p2pool: {
      p2PoolMode: stateFunctions.p2PoolMode,
      p2PoolPayoutAddress: stateFunctions.p2PoolPayoutAddress,
      p2PoolMiningThreads: stateFunctions.p2PoolMiningThreads,
      isP2PoolStratumPublic: stateFunctions.isP2PoolStratumPublic,
    },
    mining: {
      miningMode: stateFunctions.miningMode,
      xmrigDonateLevel: stateFunctions.xmrigDonateLevel,
    },
    tor: {
      torProxyMode: stateFunctions.torProxyMode,
      hsMonerod: stateFunctions.hsMonerod,
      hsMonerodP2P: stateFunctions.hsMonerodP2P,
      hsStagenet: stateFunctions.hsStagenet,
      hsP2Pool: stateFunctions.hsP2Pool,
      hsGrafana: stateFunctions.hsGrafana,
      hsLws: stateFunctions.hsLws,
      hsMoneroPay: stateFunctions.hsMoneroPay,
      isGlobalTorProxy: stateFunctions.isGlobalTorProxy,
    },
    services: {
      isMoneroWalletRpc: stateFunctions.isMoneroWalletRpc,
      isWatchtower: stateFunctions.isWatchtower,
      isMonitoring: stateFunctions.isMonitoring,
      grafanaDomain: stateFunctions.grafanaDomain,
      isTraefik: stateFunctions.isTraefik,
      isTraefikMonerod: stateFunctions.isTraefikMonerod,
      isTraefikStagenet: stateFunctions.isTraefikStagenet,
      isTraefikGrafana: stateFunctions.isTraefikGrafana,
      isTraefikPortainer: stateFunctions.isTraefikPortainer,
      isPortainer: stateFunctions.isPortainer,
      portainerDomain: stateFunctions.portainerDomain,
      isCuprateEnabled: stateFunctions.isCuprateEnabled,
      isMoneroLws: stateFunctions.isMoneroLws,
      isMoneroPay: stateFunctions.isMoneroPay,
      isXmrigProxy: false,
      isTraefikLws: stateFunctions.isTraefikLws,
      isTraefikMoneroPay: stateFunctions.isTraefikMoneroPay,
      lwsDomain: stateFunctions.lwsDomain,
      moneroPayDomain: stateFunctions.moneroPayDomain,
    },
    enabledBashServices,
  }), [stateFunctions, enabledBashServices]);

  const { installationCommand, isUploading, currentConfigIsUploaded, handleScriptGeneration } =
    useInstallScript({ config });

  const effectiveTab = !envString && activeTab === "env" ? "docker-compose" : activeTab;

  return (
    <Grid
      gap="lg"
      align="stretch"
      styles={{
        root: {
          padding: "0 8px",
        },
      }}
    >
      <Grid.Col span={{ xs: 12, md: 5 }}>
        <Selection />
      </Grid.Col>
      <Grid.Col span={{ xs: 12, md: 7 }}>
        <Card withBorder padding={0} radius="md">
          <Tabs value={effectiveTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="docker-compose" leftSection={<FaDocker />}>
                Docker Compose
              </Tabs.Tab>
              {hasBashCommands && (
                <Tabs.Tab value="bash-script" leftSection={<SiGnubash />}>
                  Bash Commands
                </Tabs.Tab>
              )}
              {envString && (
                <Tabs.Tab value="env" leftSection={<SiDotenv />}>
                  Environment Variables
                </Tabs.Tab>
              )}
              <Tabs.Tab value="install-script" leftSection={<FaLinux />}>
                Install Script <small>(optional)</small>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="install-script" p="md">
              <InstallScriptPanel
                fullScript={fullScript}
                scriptSummary={scriptSummary}
                hasDefaultDomain={hasDefaultDomain}
                hasP2PoolInvalidAddress={hasP2PoolInvalidAddress}
                hasMonerodPortCollision={hasMonerodPortCollision}
                installationCommand={installationCommand}
                currentConfigIsUploaded={currentConfigIsUploaded}
                isUploading={isUploading}
                onGenerate={handleScriptGeneration}
              />
            </Tabs.Panel>

            <Tabs.Panel value="docker-compose" p="md">
              <ComposePreview dockerCompose={dockerCompose} />
            </Tabs.Panel>

            {hasBashCommands && (
              <Tabs.Panel value="bash-script" p="md">
                <BashPreview bashCommands={bashCommands} />
              </Tabs.Panel>
            )}

            {envString && (
              <Tabs.Panel value="env" p="md">
                <EnvPreview env={envString} hasDefaultDomain={hasDefaultDomain} />
              </Tabs.Panel>
            )}
          </Tabs>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
