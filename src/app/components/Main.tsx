import ComposePreview from "./ComposePreview";
import Selection from "./Selection";
import { Card, Grid, Tabs } from "@mantine/core";
import BashPreview from "./BashPreview";
import EnvPreview from "./EnvPreview";
import { FaDocker, FaLinux } from "react-icons/fa";
import { SiDotenv, SiGnubash } from "react-icons/si";
import { useServicesContext } from "@/hooks/services-context";
import { networkModes } from "@/hooks/use-services";
import { useState, useEffect, useMemo } from "react";
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
    const addr = stateFunctions.p2PoolPayoutAddress;
    return !addr || addr.length !== 95 || !addr.startsWith("4");
  }, [stateFunctions.p2PoolMode, stateFunctions.p2PoolPayoutAddress]);

  const hasDefaultDomain = useMemo(() => {
    if (!stateFunctions.isTraefik) return false;
    const domains = [
      stateFunctions.isMoneroPublicNode && stateFunctions.isTraefikMonerod && stateFunctions.moneroNodeDomain,
      stateFunctions.isStagenetNode && stateFunctions.isStagenetNodePublic && stateFunctions.isTraefikStagenet && stateFunctions.stagenetNodeDomain,
      stateFunctions.isMoneroblock && stateFunctions.isTraefikMoneroblock && stateFunctions.moneroBlockDomain,
      stateFunctions.isOnionMoneroBlockchainExplorer && stateFunctions.isTraefikOnionExplorer && stateFunctions.onionMoneroBlockchainExplorerDomain,
      stateFunctions.isMonitoring && stateFunctions.isTraefikGrafana && stateFunctions.grafanaDomain,
      stateFunctions.isPortainer && stateFunctions.isTraefikPortainer && stateFunctions.portainerDomain,
    ].filter(Boolean) as string[];
    return domains.some((d) => d.includes("example.com"));
  }, [
    stateFunctions.isTraefik,
    stateFunctions.isMoneroPublicNode, stateFunctions.isTraefikMonerod, stateFunctions.moneroNodeDomain,
    stateFunctions.isStagenetNode, stateFunctions.isStagenetNodePublic, stateFunctions.isTraefikStagenet, stateFunctions.stagenetNodeDomain,
    stateFunctions.isMoneroblock, stateFunctions.isTraefikMoneroblock, stateFunctions.moneroBlockDomain,
    stateFunctions.isOnionMoneroBlockchainExplorer, stateFunctions.isTraefikOnionExplorer, stateFunctions.onionMoneroBlockchainExplorerDomain,
    stateFunctions.isMonitoring, stateFunctions.isTraefikGrafana, stateFunctions.grafanaDomain,
    stateFunctions.isPortainer, stateFunctions.isTraefikPortainer, stateFunctions.portainerDomain,
  ]);

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
    () => ({ monitoring: checkedServices.some((s) => s.name === "Monitoring") }),
    [checkedServices]
  );

  const { installationCommand, isUploading, currentConfigIsUploaded, handleScriptGeneration } =
    useInstallScript({
      dockerComposeYaml,
      enabledBashServices,
      envString,
      isExposed,
      firewallPorts,
      networkMode: stateFunctions.networkMode,
    });

  useEffect(() => {
    if (!envString && activeTab === "env") {
      setActiveTab("docker-compose");
    }
  }, [envString, activeTab]);

  return (
    <Grid
      gutter="lg"
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
          <Tabs value={activeTab} onChange={setActiveTab}>
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
