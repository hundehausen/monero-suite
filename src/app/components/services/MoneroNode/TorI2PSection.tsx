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
  } = useMonerodState();

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
        <TextInput
          label={
            <ExplainingLabel
              label="Anonymous Inbound"
              explanation="Allow anonymous inbound connections over Tor/I2P. Format: onion_address:port,bind_ip:port[,max_connections]. Requires a Tor hidden service forwarding to the bind address. Must be used with --tx-proxy."
            />
          }
          value={anonymousInbound}
          onChange={(e) => setAnonymousInbound(e.currentTarget.value)}
          placeholder="your_onion_address.onion:18084,127.0.0.1:18084,25"
        />
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default TorI2PSection;
