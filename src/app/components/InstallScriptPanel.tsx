import { TbCheck, TbCopy, TbDownload } from "react-icons/tb";
import {
  ActionIcon,
  Button,
  Card,
  CopyButton,
  List,
  Stack,
  Text,
  TextInput,
  Tooltip,
  rem,
} from "@mantine/core";
import { SiGnubash } from "react-icons/si";
import { CodeHighlightTabs } from "@mantine/code-highlight";
import "@mantine/code-highlight/styles.css";

interface InstallScriptPanelProps {
  fullScript: string;
  scriptSummary: string[];
  hasDefaultDomain: boolean;
  hasP2PoolInvalidAddress: boolean;
  installationCommand: string | undefined;
  currentConfigIsUploaded: boolean;
  isUploading: boolean;
  onGenerate: () => void;
}

export default function InstallScriptPanel({
  fullScript,
  scriptSummary,
  hasDefaultDomain,
  hasP2PoolInvalidAddress,
  installationCommand,
  currentConfigIsUploaded,
  isUploading,
  onGenerate,
}: InstallScriptPanelProps) {
  const handleDownload = () => {
    const blob = new Blob([fullScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "install.sh";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isBlocked = hasDefaultDomain || hasP2PoolInvalidAddress;

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Every command is visible below — review it before running. Supported
        distros: Ubuntu, Debian, Fedora, CentOS Stream, Rocky Linux, AlmaLinux,
        and RHEL. Pass <strong>--verbose</strong> for full command output.
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

      <Tooltip
        label={
          hasDefaultDomain
            ? "Replace all example.com domains in the Traefik section first"
            : hasP2PoolInvalidAddress
              ? "Enter a valid Monero payout address in the P2Pool section first"
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

      <TextInput
        placeholder="Press Generate Install Command"
        label="Paste this into your terminal:"
        value={installationCommand ?? ""}
        disabled={!installationCommand}
        rightSection={
          <CopyButton value={installationCommand ?? ""} timeout={2000}>
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
        label={
          hasDefaultDomain
            ? "Replace all example.com domains in the Traefik section first"
            : "Enter a valid Monero payout address in the P2Pool section first"
        }
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
