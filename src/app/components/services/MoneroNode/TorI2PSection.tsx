import { Accordion, SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { TorI2PSectionProps } from "./types";
import ExplainingLabel from "../../ExplainingLabel";

const TorI2PSection = ({ stateFunctions }: TorI2PSectionProps) => {
  const {
    padTransactions,
    setPadTransactions,
    anonymousInbound,
    setAnonymousInbound,
  } = stateFunctions;

  return (
    <Accordion.Item value="tor_i2p">
      <Accordion.Control>
        <Title order={4}>Tor/I2P</Title>
      </Accordion.Control>
      <Accordion.Panel>
        <SimpleGrid cols={1} spacing="md">
          <Switch
            label={
              <ExplainingLabel
                label="Pad Transactions"
                explanation="Add random padding to transaction data for improved privacy. This makes transactions less identifiable but slightly larger."
              />
            }
            checked={padTransactions}
            onChange={(event) => setPadTransactions(event.currentTarget.checked)}
          />
          <TextInput
            label={
              <ExplainingLabel
                label="Anonymous Inbound"
                explanation="Specify Tor/I2P inbound addresses in format: [tor|i2p],address,port[,max_connections]. Example: tor,abcdefgh.onion,18083,100"
              />
            }
            value={anonymousInbound}
            onChange={(e) => setAnonymousInbound(e.currentTarget.value)}
            placeholder="tor,abcdefghijklmnop.onion,18083"
          />
        </SimpleGrid>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default TorI2PSection;
