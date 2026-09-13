"use client";

import { useState } from "react";
import { TbCheck, TbCopy, TbDownload } from "react-icons/tb";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  CopyButton,
  List,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
  rem,
} from "@mantine/core";
import { SiGnubash } from "react-icons/si";
import { CodeHighlightTabs } from "@mantine/code-highlight";

interface InstallScriptPanelProps {
  fullScript: string;
  scriptSummary: string[];
  hasDefaultDomain: boolean;
  hasP2PoolInvalidAddress: boolean;
  hasMonerodPortCollision: boolean;
  defaultSecretWarnings: string[];
  installationCommand: string | undefined;
  verboseInstallationCommand: string | undefined;
  currentConfigIsUploaded: boolean;
  isUploading: boolean;
  onGenerate: () => void;
}

export default function InstallScriptPanel({
  fullScript,
  scriptSummary,
  hasDefaultDomain,
  hasP2PoolInvalidAddress,
  hasMonerodPortCollision,
  defaultSecretWarnings,
  installationCommand,
  verboseInstallationCommand,
  currentConfigIsUploaded,
  isUploading,
  onGenerate,
}: InstallScriptPanelProps) {
  const [verboseCommand, setVerboseCommand] = useState(false);
  const commandToCopy = verboseCommand
    ? verboseInstallationCommand
    : installationCommand;

  const handleDownload = () => {
    const blob = new Blob([fullScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "install.sh";
    a.click();
    URL.revokeObjectURL(url);
  };

  const blockReason = hasDefaultDomain
    ? "Replace all example.com domains in the Traefik section first"
    : hasP2PoolInvalidAddress
      ? "Enter a valid Monero payout address in the P2Pool section first"
      : hasMonerodPortCollision
        ? "Change the P2P or ZMQ publisher bind port in the Monero Node section — it collides with a port monerod binds inside the container"
        : "";

  const isBlocked = blockReason !== "";

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Every command is visible below. Review it before running. Supported
        distros: Debian/Ubuntu and derivatives (Mint, Pop!_OS, Raspberry Pi OS),
        Fedora, CentOS Stream, Rocky Linux, AlmaLinux, and RHEL. Image pulls
        print live progress. Toggle verbose below for apt and Docker-install
        output. If you are not root, the script may ask for your sudo password
        on the terminal.
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
        withExpandButton
        defaultExpanded={false}
        maxCollapsedHeight={500}
        styles={{
          root: {
            overflow: "auto",
            borderRadius: "4px",
          },
        }}
      />

      {hasDefaultDomain && (
        <Text c="red" size="sm">
          Please change all service domains from the default &quot;example.com&quot; in
          the Traefik section before generating the script.
        </Text>
      )}

      {hasP2PoolInvalidAddress && (
        <Text c="red" size="sm">
          P2Pool requires a valid primary Monero address (95 characters,
          starting with 4) in the P2Pool section.
        </Text>
      )}

      {hasMonerodPortCollision && (
        <Text c="red" size="sm">
          The P2P or ZMQ publisher bind port collides with a port monerod binds
          inside the container (RPC, ZMQ publisher, or P2P). Change it in the
          Monero Node section.
        </Text>
      )}

      {defaultSecretWarnings.map((warning) => (
        <Alert key={warning} variant="light" color="yellow">
          {warning}
        </Alert>
      ))}

      <Tooltip
        label={
          isBlocked
            ? blockReason
            : currentConfigIsUploaded
              ? "Command is up to date — change settings to regenerate"
              : ""
        }
        disabled={!isBlocked && !currentConfigIsUploaded}
      >
        <Button
          onClick={onGenerate}
          disabled={currentConfigIsUploaded || isBlocked}
          loading={isUploading}
        >
          Generate Install Command
        </Button>
      </Tooltip>

      <Switch
        checked={verboseCommand}
        onChange={(event) => setVerboseCommand(event.currentTarget.checked)}
        label="Verbose command (apt and Docker-install output)"
        disabled={!installationCommand}
      />

      <TextInput
        placeholder="Press Generate Install Command"
        label="Paste this into your terminal:"
        value={commandToCopy ?? ""}
        disabled={!commandToCopy}
        rightSection={
          <CopyButton value={commandToCopy ?? ""} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
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

      <Text size="sm">Or download and run manually:</Text>

      <Tooltip
        label={blockReason}
        disabled={!isBlocked}
      >
        <Button
          variant="light"
          leftSection={<TbDownload />}
          disabled={isBlocked}
          onClick={handleDownload}
        >
          Download install.sh
        </Button>
      </Tooltip>
    </Stack>
  );
}
