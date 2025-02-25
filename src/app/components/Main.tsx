import ComposePreview from "./ComposePreview";
import Selection from "./Selection";
import { TbCheck, TbCopy } from "react-icons/tb";
import {
  Accordion,
  AccordionStylesNames,
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  CopyButton,
  Flex,
  Grid,
  Text,
  TextInput,
  Tooltip,
  rem,
} from "@mantine/core";
import BashPreview from "./BashPreview";
import EnvPreview from "./EnvPreview";
import { FaDocker, FaUbuntu } from "react-icons/fa";
import { SiDotenv, SiGnubash } from "react-icons/si";
import InstallScriptInfoCard from "./InstallScriptInfoCard";
import { useServices, networkModes } from "@/hooks/use-services";
import { useState, useEffect, CSSProperties, useRef } from "react";
import { generateInstallationScript } from "../actions";
import {
  generateDockerComposeFile,
  generateBashScriptFile,
  generateEnvFile,
} from "../utils";

const panelStyles = {
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
} as Partial<Record<AccordionStylesNames, CSSProperties>>;

export default function Main() {
  const { services, stateFunctions } = useServices();
  const [scriptUrl, setScriptUrl] = useState<string>();
  const [installationCommand, setInstallationCommand] = useState<string>();
  const [accordionItems, setAccordionItems] = useState([
    "install-script",
    "docker-compose",
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentConfigIsUploaded, setCurrentConfigIsUploaded] = useState(false);
  const [agreeOwnRisk, setAgreeOwnRisk] = useState(false);
  const [agreePreview, setAgreePreview] = useState(false);

  // Store the last uploaded configuration for comparison
  const lastUploadedConfig = useRef<{
    services: string | null;
    networkMode: string | null;
  }>({
    services: null,
    networkMode: null,
  });

  const checkedServices = Object.values(services).filter(
    (service) => service.checked !== false && service.checked !== "none"
  );

  const dockerCompose = generateDockerComposeFile(checkedServices);

  const bashCommands = generateBashScriptFile(
    checkedServices,
    stateFunctions.networkMode === networkModes.exposed
  );

  const envString = generateEnvFile(checkedServices);

  const handleScriptGeneration = async () => {
    if (!agreeOwnRisk || !agreePreview) {
      return;
    }
    setIsUploading(true);
    const configId = await generateInstallationScript(
      checkedServices,
      dockerCompose,
      envString,
      stateFunctions.networkMode === networkModes.exposed
    );
    setIsUploading(false);

    if (!configId) {
      return;
    }

    // Store the current configuration that was uploaded
    lastUploadedConfig.current = {
      services: JSON.stringify(checkedServices),
      networkMode: stateFunctions.networkMode,
    };

    setCurrentConfigIsUploaded(true);
    setScriptUrl(`${window.location.origin}/install/${configId}`);
  };

  // Reset currentConfigIsUploaded if services or network mode changes
  useEffect(() => {
    if (!currentConfigIsUploaded) return;

    const currentServicesString = JSON.stringify(checkedServices);
    const currentNetworkMode = stateFunctions.networkMode;

    if (
      lastUploadedConfig.current.services !== currentServicesString ||
      lastUploadedConfig.current.networkMode !== currentNetworkMode
    ) {
      setCurrentConfigIsUploaded(false);
    }
  }, [checkedServices, stateFunctions.networkMode, currentConfigIsUploaded]);

  useEffect(() => {
    if (!scriptUrl) {
      return;
    }
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
        <Selection services={services} stateFunctions={stateFunctions} />
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
            <Accordion.Control icon={<FaUbuntu />}>
              <Flex direction={"row"} gap={16} align={"center"}>
                <Text size="lg">Installation Script for Debian / Ubuntu</Text>
                <Badge>New!</Badge>
              </Flex>
            </Accordion.Control>
            <Accordion.Panel styles={panelStyles}>
              <InstallScriptInfoCard />
              <Text fw={500}>Please accept to continue:</Text>
              <Checkbox
                checked={agreeOwnRisk}
                onChange={(event) =>
                  setAgreeOwnRisk(event.currentTarget.checked)
                }
                label="I use this beta feature at my own risk"
              />
              <Checkbox
                checked={agreePreview}
                onChange={(event) =>
                  setAgreePreview(event.currentTarget.checked)
                }
                label="I will preview the script before executing it"
              />
              <Button
                onClick={handleScriptGeneration}
                disabled={
                  currentConfigIsUploaded || !agreeOwnRisk || !agreePreview
                }
                loading={isUploading}
              >
                Generate Installation Script
              </Button>
              <TextInput
                placeholder="Press Generate Installation Script Button"
                label="Paste this into your terminal:"
                value={installationCommand}
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
              {installationCommand && (
                <Text c="red" size="sm">
                  {`Always preview the script, especially if you haven't
              generated it by yourself!`}
                </Text>
              )}
              <Button
                disabled={!installationCommand || !currentConfigIsUploaded}
                onClick={() => {
                  window.open(scriptUrl, "_blank");
                }}
              >
                Preview script in new tab
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
                <Text size="lg">Environement Variables</Text>
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
