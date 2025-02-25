import { Accordion, Checkbox, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

const MoneroWalletRpcSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isMoneroWalletRpc, setIsMoneroWalletRpc } = stateFunctions;

  return (
    <Accordion.Item value="monero-wallet-rpc">
      <Accordion.Control>
        <Text size="lg">Monero Wallet RPC</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["monero-wallet-rpc"].description}</Text>
        <Checkbox
          checked={isMoneroWalletRpc}
          label="Monero Wallet RPC"
          labelPosition="left"
          size="lg"
          onChange={(event) =>
            setIsMoneroWalletRpc(event.currentTarget.checked)
          }
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default MoneroWalletRpcSection;
