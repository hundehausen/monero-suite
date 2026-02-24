import { NumberInput, SimpleGrid, Switch, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const P2PNetworkSection = () => {
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
  } = useMonerodState();

  return (
    <AccordionItemComponent
      value="p2p"
      title={<Title order={4}>P2P Network</Title>}
    >
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
              explanation="Maximum number of outgoing connections. Monerod default is 12. A higher value like 32 is recommended for faster sync and better transaction propagation."
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
              explanation="Maximum number of incoming connections. Monerod default is unlimited (-1). Setting a cap of around 48 is recommended for better resource management."
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
              explanation="Maximum upload bandwidth in kB/s. Monerod default is 8192 kB/s (~8 MB/s). Set to -1 to use the monerod default."
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
              explanation="Maximum download bandwidth in kB/s. Monerod default is 32768 kB/s (~32 MB/s). Higher values speed up initial sync. Set to -1 to use the monerod default."
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
              explanation="Disables automatic port forwarding via UPnP. Enable this if you prefer to configure port forwarding manually on your router. Recommended to disable for privacy."
            />
          }
          checked={noIgd}
          onChange={(event) => setNoIgd(event.currentTarget.checked)}
        />
        <Switch
          label={
            <ExplainingLabel
              label="Hide My Port"
              explanation="Don't advertise your node as a public peer candidate. Your node can still connect to others but won't be discoverable."
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
    </AccordionItemComponent>
  );
};

export default P2PNetworkSection;
