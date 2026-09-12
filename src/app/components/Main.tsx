"use client";

import ComposePreview from "./ComposePreview";
import Selection from "./Selection";
import {
  Box,
  Card,
  Drawer,
  ScrollArea,
  Splitter,
  Tabs,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import BashPreview from "./BashPreview";
import EnvPreview from "./EnvPreview";
import { FaDocker, FaLinux } from "react-icons/fa";
import { SiDotenv, SiGnubash } from "react-icons/si";
import { useServicesContext, useHasDefaultDomain } from "@/hooks/services-context";
import { networkModes } from "@/hooks/use-services";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSectionFocus } from "./section-focus";
import {
  generateDockerComposeFile,
  generateBashScriptFile,
  generateBashPreview,
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
import { MD_UP, useLgUp, useMdUp } from "./shell-breakpoints";
import { desktopShellKind, type DesktopShellKind } from "./desktop-shell";
import AdvancedConfigModal, {
  AdvancedConfigForm,
} from "./services/MoneroNode/AdvancedConfigModal";

const SPLITTER_HEIGHT =
  "calc(100dvh - var(--app-shell-header-offset, 56px) - 2 * var(--app-shell-padding, 0px))";

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

const splitterChrome: {
  h: string;
  mx: number;
  styles: { pane: { overflow: "hidden"; minWidth: number } };
} = {
  h: SPLITTER_HEIGHT,
  mx: 8,
  styles: { pane: { overflow: "hidden", minWidth: 0 } },
};

function DesktopShell({
  kind,
  preview,
}: {
  kind: DesktopShellKind;
  preview: ReactNode;
}) {
  const { closeAdvanced, formOpened } = useSectionFocus();
  const advancedPane = (
    <ScrollArea h="100%" type="hover" offsetScrollbars>
      <Box p="sm">
        <AdvancedConfigForm onClose={closeAdvanced} showTitle />
      </Box>
    </ScrollArea>
  );
  const formPane = (
    <ScrollArea h="100%" type="hover" offsetScrollbars>
      <Box p="sm">{formOpened ? null : <Selection />}</Box>
    </ScrollArea>
  );

  if (kind === "advanced-3") {
    return (
      <Splitter {...splitterChrome} key="advanced-3">
        <Splitter.Pane defaultSize={25} min={15}>
          {formPane}
        </Splitter.Pane>
        <Splitter.Pane defaultSize={35} min={20}>
          {advancedPane}
        </Splitter.Pane>
        <Splitter.Pane defaultSize={40} min={25}>
          {preview}
        </Splitter.Pane>
      </Splitter>
    );
  }

  if (kind === "advanced-2") {
    return (
      <>
        <Splitter {...splitterChrome} key="advanced-2">
          <Splitter.Pane defaultSize={42} min={20}>
            {advancedPane}
          </Splitter.Pane>
          <Splitter.Pane defaultSize={58} min={25}>
            {preview}
          </Splitter.Pane>
        </Splitter>
        <Box display="none">
          <Selection />
        </Box>
      </>
    );
  }

  return (
    <Splitter {...splitterChrome} key="playground">
      <Splitter.Pane defaultSize={42} min={15}>
        {formPane}
      </Splitter.Pane>
      <Splitter.Pane defaultSize={58} min={25}>
        {preview}
      </Splitter.Pane>
    </Splitter>
  );
}

export default function Main() {
  const { services, stateFunctions, config } = useServicesContext();
  const { formOpened, closeForm, advancedOpened, closeAdvanced } =
    useSectionFocus();
  const mdUp = useMdUp();
  const lgUp = useLgUp();
  const [activeTab, setActiveTab] = useState<string | null>("docker-compose");
  const shellKind = desktopShellKind({ advancedOpened, lgUp });

  useEffect(() => {
    const mediaQuery = window.matchMedia(MD_UP);
    const closeIfDesktop = () => {
      if (mediaQuery.matches) closeForm();
    };
    mediaQuery.addEventListener("change", closeIfDesktop);
    return () => mediaQuery.removeEventListener("change", closeIfDesktop);
  }, [closeForm]);

  useHotkeys(
    mdUp && advancedOpened ? [["Escape", closeAdvanced]] : [],
    []
  );

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
  const serviceBashCommands = useMemo(
    () => generateBashScriptFile(checkedServices),
    [checkedServices]
  );
  const envString = useMemo(() => generateEnvFile(checkedServices), [checkedServices]);
  const isExposed = stateFunctions.networkMode === networkModes.exposed;
  const firewallPorts = useMemo(() => getFirewallPorts(checkedServices), [checkedServices]);
  const dockerComposeYaml = useMemo(() => stringify(dockerCompose), [dockerCompose]);

  const upgradeSystemPackages = stateFunctions.upgradeSystemPackages;
  const bashCommands = useMemo(
    () => generateBashPreview(checkedServices, upgradeSystemPackages),
    [checkedServices, upgradeSystemPackages]
  );
  const hasBashCommands = bashCommands.length > 0;
  const fullScript = useMemo(
    () =>
      generateInstallationScript(
        dockerComposeYaml,
        serviceBashCommands,
        envString || undefined,
        isExposed,
        firewallPorts,
        upgradeSystemPackages
      ),
    [dockerComposeYaml, serviceBashCommands, envString, isExposed, firewallPorts, upgradeSystemPackages]
  );

  const scriptSummary = useMemo(
    () =>
      generateScriptSummary(
        checkedServices,
        envString,
        isExposed,
        firewallPorts,
        upgradeSystemPackages
      ),
    [checkedServices, envString, isExposed, firewallPorts, upgradeSystemPackages]
  );

  const { installationCommand, isUploading, currentConfigIsUploaded, handleScriptGeneration } =
    useInstallScript({ config });

  const effectiveTab =
    (!envString && activeTab === "env") ||
    (!hasBashCommands && activeTab === "bash-script")
      ? "docker-compose"
      : activeTab;

  const previewCard = (fill: boolean) => (
    <Card
      withBorder
      padding={0}
      radius="md"
      h={fill ? "100%" : undefined}
      style={fill ? { overflow: "auto" } : undefined}
    >
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
  );

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
      {/* CSS visibility, not useMdUp: that hook is false on the server and mismatches desktop. */}
      <Box hiddenFrom="md" px={8}>
        {previewCard(false)}
      </Box>
      <Box visibleFrom="md">
        <DesktopShell kind={shellKind} preview={previewCard(true)} />
      </Box>
      <AdvancedConfigModal
        opened={advancedOpened && !mdUp}
        onClose={closeAdvanced}
      />
    </>
  );
}
