import { SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const TorI2PSection = () => {
  const {
    padTransactions,
    setPadTransactions,
    anonymousInbound,
    setAnonymousInbound,
    txProxyDisableNoise,
    setTxProxyDisableNoise,
  } = useMonerodState();

  const anonymousInboundError = (): string | null => {
    if (!anonymousInbound) return null;
    const parts = anonymousInbound.split(",");
    if (parts.length < 2) return "Format: onion_address:port,bind_ip:port[,max_connections]";
    if (!parts[0].includes(":") || !parts[1].includes(":"))
      return "Format: onion_address:port,bind_ip:port[,max_connections]";
    if (parts.length > 2 && !/^\d+$/.test(parts[2].trim()))
      return "Max connections must be a number";
    return null;
  };

  return (
    <AccordionItemComponent
      value="tor_i2p"
      title={<Title order={4}>Tor/I2P</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <Switch
          label={
            <ExplainingLabel
              label="Pad Transactions"
              explanation="Pad relayed transactions to the next 1024 bytes to hinder traffic analysis. Slightly increases bandwidth usage."
            />
          }
          checked={padTransactions}
          onChange={(event) => setPadTransactions(event.currentTarget.checked)}
        />
        <Switch
          label={
            <ExplainingLabel
              label="Disable Noise (tx-proxy)"
              explanation={
                "Only applies when a Tor proxy is enabled. By default, transactions are relayed through Tor with random timing delays (Dandelion++ stem phase) to resist traffic analysis. "
                + "Enabling this skips the delay and broadcasts transactions immediately — slightly faster, but with slightly less traffic analysis resistance. "
                + "Leave disabled unless you have a specific reason to change it."
              }
            />
          }
          checked={txProxyDisableNoise}
          onChange={(event) =>
            setTxProxyDisableNoise(event.currentTarget.checked)
          }
        />
        <TextInput
          label={
            <ExplainingLabel
              label="Anonymous Inbound"
              explanation="Allow other Tor nodes to initiate connections to your node anonymously. Requires a Tor hidden service for your node's P2P port (see Tor Hidden Services section). Format: onion_address:port,bind_ip:port[,max_connections]"
            />
          }
          value={anonymousInbound}
          onChange={(e) => setAnonymousInbound(e.currentTarget.value)}
          placeholder="your_onion_address.onion:18084,127.0.0.1:18084,25"
          error={anonymousInboundError()}
        />
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default TorI2PSection;
