"use client";

import { Alert, Checkbox, Text } from "@mantine/core";
import { useServicesContext, useMoneroPayState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const MoneroPaySection = () => {
  const { services } = useServicesContext();
  const { isMoneroPay, setIsMoneroPay } = useMoneroPayState();

  return (
    <AccordionItemComponent
      value="moneropay"
      checked={isMoneroPay}
      title="MoneroPay"
    >
      <Text size="sm">{services.moneropay.description}</Text>

      <Checkbox
        checked={isMoneroPay}
        label="Enable MoneroPay"
        labelPosition="left"
        onChange={(event) =>
          setIsMoneroPay(event.currentTarget.checked)
        }
        size="lg"
      />

      <Text size="sm">
        Enabling MoneroPay also turns on Monero Wallet RPC — it is required
        for the payment API.
      </Text>
      <Alert variant="light" color="yellow" title="Hot wallet">
        MoneroPay creates a <strong>hot</strong> wallet named{" "}
        <strong>wallet</strong> in the wallet-rpc volume. Spend keys live
        there. Treat that volume as secret.
      </Alert>
    </AccordionItemComponent>
  );
};

export default MoneroPaySection;
