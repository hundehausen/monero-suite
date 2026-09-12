"use client";

import ComposePreview from "./ComposePreview";
import Selection from "./Selection";
import {
  Box,
  Card,
  Drawer,
  Grid,
  ScrollArea,
  Tabs,
} from "@mantine/core";
import BashPreview from "./BashPreview";
import EnvPreview from "./EnvPreview";
import { FaDocker, FaLinux } from "react-icons/fa";
import { SiDotenv, SiGnubash } from "react-icons/si";
import { useServicesContext, useHasDefaultDomain } from "@/hooks/services-context";
import { networkModes } from "@/hooks/use-services";
import { useEffect, useMemo, useState } from "react";
import { useSectionFocus } from "./section-focus";
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
import { getMonerodP2pPortCollisions, getMonerodZmqPortCollisions } from "@/lib/service-generators/monerod";
import { isValidP2PoolPayoutAddress } from "@/lib/schemas";
import { getDefaultSecretWarnings } from "@/lib/default-secrets";

function TabLabel({ full, short }: { full: string; short: string }) {
  return (
    <>
      <Box component="span" visibleFrom="sm">
        {full}
      </Box>
      <Box component="span" hiddenFrom="sm">
        {short}
      </Box>
    </>
  );
}

/** Same query as Mantine `md` / the Selection `visibleFrom="md"` column. */
const MD_UP = "(min-width: 62em)";

export default function Main() {
  const { services, stateFunctions, config } = useServicesContext();
  const { formOpened, closeForm } = useSectionFocus();
  const [activeTab, setActiveTab] = useState<string | null>("docker-compose");

  useEffect(() => {
    const mediaQuery = window.matchMedia(MD_UP);
    const closeIfDesktop = () => {
      if (mediaQuery.matches) closeForm();
    };
    mediaQuery.addEventListener("change", closeIfDesktop);
    return () => mediaQuery.removeEventListener("change", closeIfDesktop);
  }, [closeForm]);

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

  const defaultSecretWarnings = useMemo(
    () => getDefaultSecretWarnings(config).map((warning) => warning.message),
    [config]
  );

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

  const { installationCommand, isUploading, currentConfigIsUploaded, handleScriptGeneration } =
    useInstallScript({ config });

  const effectiveTab = !envString && activeTab === "env" ? "docker-compose" : activeTab;

  return (
    <>
      <Drawer
        opened={formOpened}
        onClose={closeForm}
        title="Configure services"
        position="left"
        size="90%"
        hiddenFrom="md"
        padding="md"
        closeButtonProps={{ "aria-label": "Close" }}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {formOpened ? <Selection /> : null}
      </Drawer>
      <Grid
        gap="lg"
        align="stretch"
        styles={{
          root: {
            padding: "0 8px",
          },
        }}
      >
        <Grid.Col span={5} visibleFrom="md">
          {formOpened ? null : <Selection />}
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder padding={0} radius="md">
            <Tabs value={effectiveTab} onChange={setActiveTab}>
              <Tabs.List style={{ flexWrap: "nowrap", overflowX: "auto" }}>
                <Tabs.Tab value="docker-compose" leftSection={<FaDocker />}>
                  <TabLabel full="Docker Compose" short="Compose" />
                </Tabs.Tab>
                {hasBashCommands && (
                  <Tabs.Tab value="bash-script" leftSection={<SiGnubash />}>
                    <TabLabel full="Bash Commands" short="Bash" />
                  </Tabs.Tab>
                )}
                {envString && (
                  <Tabs.Tab value="env" leftSection={<SiDotenv />}>
                    <TabLabel full="Environment Variables" short="Env" />
                  </Tabs.Tab>
                )}
                <Tabs.Tab value="install-script" leftSection={<FaLinux />}>
                  <TabLabel
                    full="Install Script (optional)"
                    short="Install"
                  />
                </Tabs.Tab>
              </Tabs.List>

            <Tabs.Panel value="install-script" p="md">
              <InstallScriptPanel
                fullScript={fullScript}
                scriptSummary={scriptSummary}
                hasDefaultDomain={hasDefaultDomain}
                hasP2PoolInvalidAddress={hasP2PoolInvalidAddress}
                hasMonerodPortCollision={hasMonerodPortCollision}
                defaultSecretWarnings={defaultSecretWarnings}
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
    </>
  );
}
