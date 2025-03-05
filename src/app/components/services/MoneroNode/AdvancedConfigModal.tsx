import { Button, Group, Modal, ScrollArea, Text, Anchor, Accordion } from "@mantine/core";
import { AdvancedConfigModalProps } from "./types";
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

const AdvancedConfigModal = ({ opened, onClose, stateFunctions }: AdvancedConfigModalProps) => {
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
      <Text mb="md">
        {`Configure advanced options for your Monero node. These settings provide fine-grained control
        over the node's behavior, performance, and resource usage.`}
      </Text>
      
      <Accordion multiple defaultValue={['logging']}>
        <LoggingSection stateFunctions={stateFunctions} moneroNodeNoLogs={stateFunctions.moneroNodeNoLogs} />
        <StorageSection 
          stateFunctions={stateFunctions} 
          isPrunedNode={stateFunctions.isPrunedNode} 
        />
        <NetworkSecuritySection stateFunctions={stateFunctions} />
        <NodeConnectionsSection stateFunctions={stateFunctions} />
        <P2PNetworkSection stateFunctions={stateFunctions} />
        <TorI2PSection stateFunctions={stateFunctions} />
        <PerformanceSection stateFunctions={stateFunctions} />
        <BootstrapNodeSection 
          stateFunctions={stateFunctions} 
          bootstrapDaemonAddress={stateFunctions.bootstrapDaemonAddress} 
        />
        <RpcZmqSection 
          stateFunctions={stateFunctions} 
          zmqPubEnabled={stateFunctions.zmqPubEnabled} 
        />
        <NotificationsSection stateFunctions={stateFunctions} />
        <MiningSection 
          stateFunctions={stateFunctions} 
          startMining={stateFunctions.startMining} 
          bgMiningEnable={stateFunctions.bgMiningEnable} 
        />
      </Accordion>
      
      <Group justify="flex-end" mt="xl" pr={20}>
        <Button onClick={onClose}>Close</Button>
      </Group>
    </Modal>
  );
};

export default AdvancedConfigModal;
