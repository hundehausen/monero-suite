import { Checkbox, Text } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import AccordionItemComponent from "./AccordionItemComponent";

const MoneroWalletRpcSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isMoneroWalletRpc, setIsMoneroWalletRpc } = stateFunctions;

  return (
    <AccordionItemComponent
      value="monero-wallet-rpc"
      title="Monero Wallet RPC"
    >
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
    </AccordionItemComponent>
  );
};

export default MoneroWalletRpcSection;
