import { SimpleGrid, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const BootstrapNodeSection = () => {
  const {
    bootstrapDaemonAddress,
    setBootstrapDaemonAddress,
    bootstrapDaemonLogin,
    setBootstrapDaemonLogin,
  } = useMonerodState();

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
              explanation="Proxy RPC requests to a remote node while your blockchain is syncing. Allows wallets to connect and operate before sync completes. Format: host:port"
            />
          }
          value={bootstrapDaemonAddress}
          onChange={(e) => setBootstrapDaemonAddress(e.currentTarget.value)}
          placeholder="node.example.org:18089"
        />
        {bootstrapDaemonAddress && (
          <TextInput
            label={
              <ExplainingLabel
                label="Bootstrap Daemon Login"
                explanation="Credentials for accessing the bootstrap daemon if it requires authentication. Format: username[:password]"
              />
            }
            value={bootstrapDaemonLogin}
            onChange={(e) => setBootstrapDaemonLogin(e.currentTarget.value)}
            placeholder="username:password"
          />
        )}
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default BootstrapNodeSection;
