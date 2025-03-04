import { Accordion, NumberInput, SimpleGrid, Switch, Title } from "@mantine/core";
import { P2PNetworkSectionProps } from "./types";
import ExplainingLabel from "../../ExplainingLabel";

const P2PNetworkSection = ({ stateFunctions }: P2PNetworkSectionProps) => {
  const {
    p2pBindPort,
    setP2pBindPort,
    p2pExternalPort,
    setP2pExternalPort,
    outPeers,
    setOutPeers,
    inPeers,
    setInPeers,
    limitRateUp,
    setLimitRateUp,
    limitRateDown,
    setLimitRateDown,
    noIgd,
    setNoIgd,
    hidePort,
    setHidePort,
    allowLocalIp,
    setAllowLocalIp,
    offlineMode,
    setOfflineMode,
    maxConnectionsPerIp,
    setMaxConnectionsPerIp,
  } = stateFunctions;

  return (
    <Accordion.Item value="p2p">
      <Accordion.Control>
        <Title order={4}>P2P Network</Title>
      </Accordion.Control>
      <Accordion.Panel>
        <SimpleGrid cols={1} spacing="md">
          <NumberInput
            label={
              <ExplainingLabel
                label="P2P Bind Port"
                explanation="Port for P2P network communications with other nodes. Default is 18080."
              />
            }
            value={parseInt(p2pBindPort)}
            onChange={(value) => setP2pBindPort(String(value))}
            min={1025}
            max={65535}
          />
          <NumberInput
            label={
              <ExplainingLabel
                label="P2P External Port"
                explanation="Port to be advertised to peers. Use this if your node is behind NAT and your router forwards a different external port to your internal P2P port. Default is 0 (use the same port as p2p-bind-port)."
              />
            }
            value={parseInt(p2pExternalPort)}
            onChange={(value) => setP2pExternalPort(String(value))}
            min={0}
            max={65535}
          />
          <NumberInput
            label={
              <ExplainingLabel
                label="Out Peers"
                explanation="Maximum number of outgoing connections. Default is 8, but 32 is recommended for faster sync and better transaction awareness."
              />
            }
            value={parseInt(outPeers)}
            onChange={(value) => setOutPeers(String(value))}
            min={-1}
            max={1000}
          />
          <NumberInput
            label={
              <ExplainingLabel
                label="In Peers"
                explanation="Maximum number of incoming connections. Default is unlimited, but setting a cap of around 48 is recommended for better resource management."
              />
            }
            value={parseInt(inPeers)}
            onChange={(value) => setInPeers(String(value))}
            min={-1}
            max={1000}
          />
          <NumberInput
            label={
              <ExplainingLabel
                label="Upload Limit (kB/s)"
                explanation="Maximum upload bandwidth in kB/s. Default is 2048 kB/s. For better network contribution, consider higher values like 1048576 kB/s (1GB/s) if your connection allows."
              />
            }
            value={parseInt(limitRateUp)}
            onChange={(value) => setLimitRateUp(String(value))}
            min={-1}
            step={1024}
          />
          <NumberInput
            label={
              <ExplainingLabel
                label="Download Limit (kB/s)"
                explanation="Maximum download bandwidth in kB/s. Default is 8192 kB/s. For faster initial sync, consider higher values like 1048576 kB/s (1GB/s) if your connection allows."
              />
            }
            value={parseInt(limitRateDown)}
            onChange={(value) => setLimitRateDown(String(value))}
            min={-1}
            step={1024}
          />
          <Switch
            label={
              <ExplainingLabel
                label="Disable IGD (UPnP Port Mapping)"
                explanation="Disables Internet Gateway Device support for automatic port mapping on routers that support UPnP."
              />
            }
            checked={noIgd}
            onChange={(event) => setNoIgd(event.currentTarget.checked)}
          />
          <Switch
            label={
              <ExplainingLabel
                label="Hide My Port"
                explanation="Prevents your node from announcing its P2P port to other peers, making your node act as a 'leech' (receiving connections but not initiating them)."
              />
            }
            checked={hidePort}
            onChange={(event) => setHidePort(event.currentTarget.checked)}
          />
          <Switch
            label={
              <ExplainingLabel
                label="Allow Local IP"
                explanation="Allow peers on local IP addresses. By default, connections from RFC1918 private networks are rejected to prevent DNS rebinding attacks."
              />
            }
            checked={allowLocalIp}
            onChange={(event) => setAllowLocalIp(event.currentTarget.checked)}
          />
          <Switch
            label={
              <ExplainingLabel
                label="Offline Mode"
                explanation="When enabled, the node does not connect to the network. Useful for working with a local copy of the blockchain without any network activity."
              />
            }
            checked={offlineMode}
            onChange={(event) => setOfflineMode(event.currentTarget.checked)}
          />
          <NumberInput
            label={
              <ExplainingLabel
                label="Max Connections Per IP"
                explanation="Maximum number of connections allowed from a single IP address. Default is 1, which helps prevent certain DoS attacks."
              />
            }
            value={parseInt(maxConnectionsPerIp)}
            onChange={(value) => setMaxConnectionsPerIp(String(value))}
            min={1}
            max={100}
          />
        </SimpleGrid>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default P2PNetworkSection;
