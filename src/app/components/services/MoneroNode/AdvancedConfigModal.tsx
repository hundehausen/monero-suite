import { Button, Group, Modal, ScrollArea, Text, Anchor, Accordion, Badge } from "@mantine/core";
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

interface AdvancedConfigModalProps {
  opened: boolean;
  onClose: () => void;
}

const AdvancedConfigModal = ({ opened, onClose }: AdvancedConfigModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Text fw="bold" fz="1.2rem">Advanced Monero Node Configuration</Text>
          <Anchor
            href="https://docs.getmonero.org/interacting/monerod-reference/"
            target="_blank"
            fw={400}
            fz="sm"
          >
            All monerod options explained
          </Anchor>
        </Group>
      }
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
      styles={{
        title: {
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }
      }}
    >
      <Group mb="md" justify="space-between">
        <Text>
          {`Configure advanced options for your Monero node. These settings provide fine-grained control
          over the node's behavior, performance, and resource usage.`}
        </Text>
        <Badge variant="light" color="green" size="sm">Changes saved automatically</Badge>
      </Group>

      <Accordion multiple defaultValue={['logging', 'rpc_zmq', 'mining', 'tor_i2p']}>
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
    </Modal>
  );
};

export default AdvancedConfigModal;
