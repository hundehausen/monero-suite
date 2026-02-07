import { Checkbox, Text } from "@mantine/core";
import { useServicesContext, useMoneroWalletRpcState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const MoneroWalletRpcSection = () => {
  const { services } = useServicesContext();
  const { isMoneroWalletRpc, setIsMoneroWalletRpc } = useMoneroWalletRpcState();

  return (
    <AccordionItemComponent
      value="monero-wallet-rpc"
      title="Monero Wallet RPC"
      checked={isMoneroWalletRpc}
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
