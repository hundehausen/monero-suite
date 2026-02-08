import ComposePreview from "./ComposePreview";
import Selection from "./Selection";
import { TbCheck, TbCopy, TbDownload } from "react-icons/tb";
import {
  Accordion,
  AccordionStylesNames,
  ActionIcon,
  Button,
  Card,
  CopyButton,
  Grid,
  List,
  Text,
  TextInput,
  Tooltip,
  rem,
} from "@mantine/core";
import BashPreview from "./BashPreview";
import EnvPreview from "./EnvPreview";
import { FaDocker, FaLinux } from "react-icons/fa";
import { SiDotenv, SiGnubash } from "react-icons/si";
import { useServicesContext } from "@/hooks/services-context";
import { networkModes } from "@/hooks/use-services";
import { useState, useEffect, useMemo, CSSProperties, useRef } from "react";
import { uploadInstallScript } from "../actions";
import {
  generateDockerComposeFile,
  generateBashScriptFile,
  generateEnvFile,
  getFirewallPorts,
} from "../utils";
import { generateInstallationScript } from "@/lib/script-generator";
import { stringify } from "yaml";
import { CodeHighlightTabs } from "@mantine/code-highlight";
import "@mantine/code-highlight/styles.css";
import type { Service } from "@/hooks/services/types";

const panelStyles = {
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
} as Partial<Record<AccordionStylesNames, CSSProperties>>;

function generateScriptSummary(
  checkedServices: Service[],
  envString: string,
  isExposed: boolean,
  firewallPorts: string
): string[] {
  const steps: string[] = [];

  steps.push("Check for root/sudo privileges");
  steps.push("Detect OS and package manager");
  steps.push("Validate network environment");
  steps.push("Install Docker (skipped if already installed)");

  const serviceNames = checkedServices.map((s) => s.name);
  steps.push(
    `Write docker-compose.yml with ${serviceNames.length} service${serviceNames.length !== 1 ? "s" : ""}: ${serviceNames.join(", ")}`
  );

  if (envString) {
    steps.push("Write .env configuration file");
  }

  const hasBash = checkedServices.some((s) => s.bash);
  if (hasBash) {
    steps.push("Update system packages and install dependencies");
    steps.push("Run service-specific setup commands");
  }

  if (isExposed && firewallPorts) {
    steps.push(`Configure firewall (ports: ${firewallPorts})`);
  }

  steps.push("Pull container images and start services");

  return steps;
}

export default function Main() {
  const { services, stateFunctions } = useServicesContext();
  const [scriptUrl, setScriptUrl] = useState<string>();
  const [installationCommand, setInstallationCommand] = useState<string>();
  const [accordionItems, setAccordionItems] = useState([
    "install-script",
    "docker-compose",
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentConfigIsUploaded, setCurrentConfigIsUploaded] = useState(false);

  // Store the last uploaded configuration for comparison
  const lastUploadedConfig = useRef<{
    config: string | null;
    networkMode: string | null;
  }>({
    config: null,
    networkMode: null,
  });

  const checkedServices = useMemo(
    () => Object.values(services).filter(
      (service) => service.checked !== false && service.checked !== "none"
    ),
    [services]
  );

  const hasDefaultDomain = useMemo(() => {
    if (!stateFunctions.isTraefik) return false;
    const domains = [
      stateFunctions.isMoneroPublicNode && stateFunctions.moneroNodeDomain,
      stateFunctions.isStagenetNode && stateFunctions.isStagenetNodePublic && stateFunctions.stagenetNodeDomain,
      stateFunctions.isMoneroblock && stateFunctions.moneroBlockDomain,
      stateFunctions.isOnionMoneroBlockchainExplorer && stateFunctions.onionMoneroBlockchainExplorerDomain,
      stateFunctions.isMonitoring && stateFunctions.grafanaDomain,
      stateFunctions.isPortainer && stateFunctions.portainerDomain,
    ].filter(Boolean) as string[];
    return domains.some((d) => d.includes("example.com"));
  }, [
    stateFunctions.isTraefik,
    stateFunctions.isMoneroPublicNode, stateFunctions.moneroNodeDomain,
    stateFunctions.isStagenetNode, stateFunctions.isStagenetNodePublic, stateFunctions.stagenetNodeDomain,
    stateFunctions.isMoneroblock, stateFunctions.moneroBlockDomain,
    stateFunctions.isOnionMoneroBlockchainExplorer, stateFunctions.onionMoneroBlockchainExplorerDomain,
    stateFunctions.isMonitoring, stateFunctions.grafanaDomain,
    stateFunctions.isPortainer, stateFunctions.portainerDomain,
  ]);

  const dockerCompose = useMemo(() => generateDockerComposeFile(checkedServices), [checkedServices]);
  const bashCommands = useMemo(() => generateBashScriptFile(checkedServices), [checkedServices]);
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

  const handleScriptGeneration = async () => {
    if (hasDefaultDomain) return;
    setIsUploading(true);

    try {
      const enabledBashServices = {
        monitoring: checkedServices.some((s) => s.name === "Monitoring"),
      };

      const configId = await uploadInstallScript({
        dockerComposeYaml,
        enabledBashServices,
        envContent: envString || undefined,
        isExposed,
        firewallPorts,
      });

      // Store the current configuration that was uploaded
      lastUploadedConfig.current = {
        config: dockerComposeYaml + JSON.stringify(enabledBashServices) + envString,
        networkMode: stateFunctions.networkMode,
      };

      setCurrentConfigIsUploaded(true);
      setScriptUrl(`${window.location.origin}/install/${configId}`);
    } catch (error) {
      console.error("Failed to upload script:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset currentConfigIsUploaded if config or network mode changes
  const enabledBashServicesKey = useMemo(
    () => JSON.stringify({ monitoring: checkedServices.some((s) => s.name === "Monitoring") }),
    [checkedServices]
  );

  useEffect(() => {
    if (!currentConfigIsUploaded) return;

    const currentConfig = dockerComposeYaml + enabledBashServicesKey + envString;
    const currentNetworkMode = stateFunctions.networkMode;

    if (
      lastUploadedConfig.current.config !== currentConfig ||
      lastUploadedConfig.current.networkMode !== currentNetworkMode
    ) {
      setCurrentConfigIsUploaded(false);
    }
  }, [dockerComposeYaml, enabledBashServicesKey, envString, stateFunctions.networkMode, currentConfigIsUploaded]);

  useEffect(() => {
    if (!scriptUrl) return;
    setInstallationCommand(`curl -sSL ${scriptUrl} | bash`);
  }, [scriptUrl]);

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
      <Grid.Col
        span={{
          xs: 12,
          md: 5,
        }}
      >
        <Selection />
      </Grid.Col>
      <Grid.Col
        span={{
          xs: 12,
          md: 7,
        }}
      >
        <Accordion
          multiple
          value={accordionItems}
          onChange={setAccordionItems}
          defaultValue={["mainnet-node"]}
          variant="separated"
          styles={{
            panel: {
              paddingTop: "8px",
            },
          }}
        >
          <Accordion.Item value="install-script">
            <Accordion.Control icon={<FaLinux />}>
              <Text size="lg">Installation Script for Linux</Text>
            </Accordion.Control>
            <Accordion.Panel styles={panelStyles}>
              <Text size="sm" c="dimmed">
                Every command is visible below — review it before running.
                Supported distros: Ubuntu, Debian, Fedora, CentOS Stream, Rocky
                Linux, AlmaLinux, and RHEL. Pass{" "}
                <strong>--verbose</strong> for full command output.
              </Text>

              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Text fw={500} mb="xs">
                  What this script does:
                </Text>
                <List size="sm" spacing="xs">
                  {scriptSummary.map((step, i) => (
                    <List.Item key={i}>{step}</List.Item>
                  ))}
                </List>
              </Card>

              <CodeHighlightTabs
                code={[
                  {
                    code: fullScript,
                    language: "bash",
                    fileName: "install.sh",
                    icon: <SiGnubash />,
                  },
                ]}
                styles={{
                  root: {
                    overflow: "auto",
                    borderRadius: "4px",
                    maxHeight: "500px",
                  },
                }}
              />

              {hasDefaultDomain && (
                <Text c="red" size="sm">
                  Please change all service domains from the default
                  &quot;example.com&quot; in the Traefik section before generating the script.
                </Text>
              )}

              <Button
                onClick={handleScriptGeneration}
                disabled={currentConfigIsUploaded || hasDefaultDomain}
                loading={isUploading}
              >
                Generate Install Command
              </Button>

              <TextInput
                placeholder="Press Generate Install Command"
                label="Paste this into your terminal:"
                value={installationCommand ?? ""}
                disabled={!installationCommand}
                rightSection={
                  <CopyButton value={installationCommand ?? ""} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? "Copied" : "Copy"}
                        withArrow
                        position="right"
                      >
                        <ActionIcon
                          color={copied ? "teal" : "gray"}
                          variant="subtle"
                          onClick={copy}
                        >
                          {copied ? (
                            <TbCheck style={{ width: rem(16) }} />
                          ) : (
                            <TbCopy style={{ width: rem(16) }} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                }
              />

              <Text size="sm">
                Or download and run manually:
              </Text>
              <Button
                variant="light"
                leftSection={<TbDownload />}
                onClick={() => {
                  const blob = new Blob([fullScript], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "install.sh";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download install.sh
              </Button>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="docker-compose">
            <Accordion.Control icon={<FaDocker />}>
              <Text size="lg">Docker Compose File</Text>
            </Accordion.Control>
            <Accordion.Panel styles={panelStyles}>
              <ComposePreview dockerCompose={dockerCompose} />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="bash-script">
            <Accordion.Control icon={<SiGnubash />}>
              <Text size="lg">Bash Commands</Text>
            </Accordion.Control>
            <Accordion.Panel styles={panelStyles}>
              <BashPreview bashCommands={bashCommands} />
            </Accordion.Panel>
          </Accordion.Item>

          {envString && (
            <Accordion.Item value="env">
              <Accordion.Control icon={<SiDotenv />}>
                <Text size="lg">Environment Variables</Text>
              </Accordion.Control>
              <Accordion.Panel styles={panelStyles}>
                <EnvPreview env={envString} />
              </Accordion.Panel>
            </Accordion.Item>
          )}
        </Accordion>
      </Grid.Col>
    </Grid>
  );
}
