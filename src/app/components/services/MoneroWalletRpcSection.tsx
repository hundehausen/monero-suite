"use client";

import { Alert, Checkbox, Stack, Text, TextInput } from "@mantine/core";
import { useServicesContext, useMoneroWalletRpcState } from "@/hooks/services-context";
import { DEFAULT_WALLET_RPC_PASSWORD } from "@/lib/constants";
import { envCredentialError } from "@/lib/schemas";
import AccordionItemComponent from "./AccordionItemComponent";
import ExplainingLabel from "../ExplainingLabel";
import SecretInput from "../SecretInput";

const MoneroWalletRpcSection = () => {
  const { services } = useServicesContext();
  const {
    isMoneroWalletRpc,
    setIsMoneroWalletRpc,
    walletRpcUser,
    setWalletRpcUser,
    walletRpcPassword,
    setWalletRpcPassword,
  } = useMoneroWalletRpcState();

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
      {isMoneroWalletRpc && (
        <Stack gap="md" mt="md" pb="xs">
          <TextInput
            label={
              <ExplainingLabel
                label="Wallet RPC user"
                explanation="Username written to WALLET_RPC_USER in the generated .env."
              />
            }
            value={walletRpcUser}
            onChange={(event) => setWalletRpcUser(event.currentTarget.value)}
            error={envCredentialError(walletRpcUser) ?? undefined}
          />
          <SecretInput
            label="Wallet RPC password"
            explanation="Password written to WALLET_RPC_PASSWORD in the generated .env. Copy it into a password manager."
            value={walletRpcPassword}
            onChange={setWalletRpcPassword}
            error={envCredentialError(walletRpcPassword)}
          />
          {walletRpcPassword === DEFAULT_WALLET_RPC_PASSWORD && (
            <Alert variant="light" color="yellow" title="Shipped default password">
              Wallet RPC still uses changeme. Change it here so the generated
              .env is not the default.
            </Alert>
          )}
        </Stack>
      )}
    </AccordionItemComponent>
  );
};

export default MoneroWalletRpcSection;
