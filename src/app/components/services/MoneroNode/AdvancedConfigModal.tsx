"use client";

import {
  Accordion,
  Anchor,
  Badge,
  Button,
  Group,
  Modal,
  ScrollArea,
  Text,
} from "@mantine/core";
import { TbExternalLink } from "react-icons/tb";
import LoggingSection from "./LoggingSection";
import StorageSection from "./StorageSection";
import NetworkSecuritySection from "./NetworkSecuritySection";
import NodeConnectionsSection from "./NodeConnectionsSection";
import P2PNetworkSection from "./P2PNetworkSection";
import TorI2PSection from "./TorI2PSection";
import PerformanceSection from "./PerformanceSection";
import BootstrapNodeSection from "./BootstrapNodeSection";
import RpcZmqSection from "./RpcZmqSection";
import NotificationsSection from "./NotificationsSection";
import MiningSection from "./MiningSection";

export const ADVANCED_CONFIG_ID = "advanced-monero-config";

const title = (
  <Group>
    <Text fw="bold" fz="1.2rem">
      Advanced Monero Node Configuration
    </Text>
    <Anchor
      href="https://docs.getmonero.org/interacting/monerod-reference/"
      target="_blank"
      rel="noopener noreferrer"
      fw={400}
      fz="sm"
      display="inline-flex"
      style={{ alignItems: "center", gap: 4 }}
      title="Opens in a new tab"
    >
      All monerod options explained
      <TbExternalLink size={14} aria-hidden />
    </Anchor>
  </Group>
);

export function AdvancedConfigForm({
  onClose,
  showTitle = false,
}: {
  onClose: () => void;
  showTitle?: boolean;
}) {
  return (
    <div id={ADVANCED_CONFIG_ID}>
      {showTitle ? title : null}
      <Group mb="md" justify="space-between" mt={showTitle ? "md" : 0}>
        <Text>
          {`Configure advanced options for your Monero node. These settings provide fine-grained control
          over the node's behavior, performance, and resource usage.`}
        </Text>
        <Badge variant="light" color="green" size="sm">
          Changes saved automatically
        </Badge>
      </Group>

      <Accordion multiple defaultValue={["logging"]}>
        <LoggingSection />
        <StorageSection />
        <NetworkSecuritySection />
        <NodeConnectionsSection />
        <P2PNetworkSection />
        <TorI2PSection />
        <PerformanceSection />
        <BootstrapNodeSection />
        <RpcZmqSection />
        <NotificationsSection />
        <MiningSection />
      </Accordion>

      <Group justify="flex-end" mt="xl" pr={20}>
        <Button onClick={onClose}>Close</Button>
      </Group>
    </div>
  );
}

const AdvancedConfigModal = ({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
      styles={{
        title: {
          fontWeight: "bold",
          fontSize: "1.2rem",
        },
      }}
    >
      <AdvancedConfigForm onClose={onClose} />
    </Modal>
  );
};

export default AdvancedConfigModal;
