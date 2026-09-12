"use client";

import { SimpleGrid, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import { rpcLoginError } from "@/lib/schemas";
import ExplainingLabel from "../../ExplainingLabel";
import SecretInput from "../../SecretInput";
import AccordionItemComponent from "../AccordionItemComponent";

const BootstrapNodeSection = () => {
  const {
    bootstrapDaemonAddress,
    setBootstrapDaemonAddress,
    bootstrapDaemonLogin,
    setBootstrapDaemonLogin,
  } = useMonerodState();

  const bootstrapAddressError = (): string | null => {
    if (!bootstrapDaemonAddress) return null;
    const portMatch = bootstrapDaemonAddress.match(/:(\d+)$/);
    if (!portMatch) return "Format: host:port (e.g. node.example.org:18089)";
    const port = parseInt(portMatch[1]);
    if (port < 1 || port > 65535) return "Port must be between 1 and 65535";
    return null;
  };

  return (
    <AccordionItemComponent
      value="bootstrap"
      title={<Title order={4}>Bootstrap Node</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <TextInput
          label={
            <ExplainingLabel
              label="Bootstrap Daemon Address"
              explanation="Forward wallet RPC requests to a trusted remote node while your blockchain is still syncing. Wallets can connect and work immediately — even before sync completes. Format: host:port"
            />
          }
          value={bootstrapDaemonAddress}
          onChange={(e) => setBootstrapDaemonAddress(e.currentTarget.value)}
          placeholder="node.example.org:18089"
          error={bootstrapAddressError()}
        />
        {bootstrapDaemonAddress && (
          <SecretInput
            label="Bootstrap Daemon Login"
            explanation="Credentials for accessing the bootstrap daemon if it requires authentication. Format: username:password. Stored in this browser only, not in the shareable URL."
            value={bootstrapDaemonLogin}
            onChange={setBootstrapDaemonLogin}
            placeholder="username:password"
            error={rpcLoginError(bootstrapDaemonLogin)}
          />
        )}
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default BootstrapNodeSection;
