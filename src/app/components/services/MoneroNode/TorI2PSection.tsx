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
                "Only applies when Tor is enabled. By default, transactions sent over Tor/I2P use the Dandelion++ stem phase — "
                + "the Tor/I2P network replaces the p2p stem, and the receiving hidden service forwards over clearnet using Dandelion++ stem after a randomized delay. "
                + "This delay helps mitigate ISP packet and timing analysis.\n\n"
                + "Enabling this option adds disable_noise to --tx-proxy, which skips the stem phase and immediately \"fluffs\" (broadcasts) "
                + "the transaction over outbound Tor connections. The receiving hidden service will also immediately fluff it over clearnet. "
                + "This gives lower latency when sending transactions while still routing through Tor/I2P to break p2p sybil attacks that Dandelion++ was designed to mitigate."
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
              explanation="Allow anonymous inbound connections over Tor/I2P. Format: onion_address:port,bind_ip:port[,max_connections]. Requires a Tor hidden service forwarding to the bind address. Must be used with --tx-proxy."
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
