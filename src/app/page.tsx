"use client";

import { useServices } from "@/hooks/use-services";
import ComposePreview from "./components/ComposePreview";
import Selection from "./components/Selection";
import { TbCheck, TbCopy } from "react-icons/tb";
import {
  Accordion,
  AccordionStylesNames,
  ActionIcon,
  AppShell,
  Badge,
  Button,
  CopyButton,
  Flex,
  Grid,
  Text,
  TextInput,
  Tooltip,
  rem,
} from "@mantine/core";
import BashPreview from "./components/BashPreview";
import Header from "./components/Header";
import { nanoid } from "nanoid";
import { CSSProperties, useEffect, useState } from "react";
import {
  generateBashScriptFile,
  generateDockerComposeFile,
  generateEnvFile,
} from "./utils";
import { generateInstallationScript } from "./actions";
import EnvPreview from "./components/EnvPreview";
import { FaDocker, FaUbuntu } from "react-icons/fa";
import { SiDotenv, SiGnubash } from "react-icons/si";
import InstallScriptInfoCard from "./components/InstallScriptInfoCard";

const panelStyles = {
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
} as Partial<Record<AccordionStylesNames, CSSProperties>>;

export default function Home() {
  const { services, stateFunctions } = useServices();
  const [configId, setConfigId] = useState<string>(nanoid());
  const [installationCommand, setInstallationCommand] = useState<string>();
  const [accordionItems, setAccordionItems] = useState([
    "install-script",
    "docker-compose",
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const checkedServices = Object.values(services).filter(
    (service) => service.checked !== false && service.checked !== "none"
  );

  const dockerCompose = generateDockerComposeFile(checkedServices);

  const bashCommands = generateBashScriptFile(checkedServices);

  const envString = generateEnvFile(checkedServices);

  const generateNewId = () => setConfigId(nanoid());

  useEffect(() => {
    generateNewId();
  }, [services]);

  return (
    <AppShell
      padding={"lg"}
      header={{
        height: {
          base: 96,
          xs: 48,
        },
      }}
    >
      <AppShell.Header
        styles={{
          header: {
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          },
        }}
      >
        <Header />
      </AppShell.Header>
      <AppShell.Main>
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
              md: 4,
            }}
          >
            <Selection services={services} stateFunctions={stateFunctions} />
          </Grid.Col>
          <Grid.Col
            span={{
              xs: 12,
              md: 8,
            }}
          >
            <Accordion
              multiple
              value={accordionItems}
              onChange={setAccordionItems}
              defaultValue={["mainnet-node"]}
              styles={{
                panel: {
                  paddingTop: "8px",
                },
              }}
            >
              <Accordion.Item value="install-script">
                <Accordion.Control icon={<FaUbuntu />}>
                  <Flex direction={"row"} gap={16} align={"center"}>
                    <Text size="lg">Installation Script for Ubuntu</Text>
                    <Badge>New!</Badge>
                  </Flex>
                </Accordion.Control>
                <Accordion.Panel
                  styles={panelStyles}
                  style={{ maxWidth: "800px" }}
                >
                  <InstallScriptInfoCard />
                  <Button
                    onClick={async () => {
                      setIsUploading(true);
                      await generateInstallationScript(
                        configId,
                        dockerCompose,
                        bashCommands,
                        envString
                      );
                      setIsUploading(false);
                      setInstallationCommand(
                        `curl -sSL ${window.location.origin}/install/${configId} | bash`
                      );
                    }}
                    loading={isUploading}
                  >
                    Generate Installation Script
                  </Button>
                  <TextInput
                    placeholder="Press Generate Installation Script Button"
                    label="Paste this into your terminal"
                    value={installationCommand}
                    disabled={!installationCommand}
                    rightSection={
                      <CopyButton
                        value={installationCommand ?? ""}
                        timeout={2000}
                      >
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
                  <Text c="red" size="sm">
                    Make sure to read the docker-compose file and the bash
                    scripts. Only run the command if you accept running these on
                    your own risk.
                  </Text>
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
      </AppShell.Main>
    </AppShell>
  );
}
