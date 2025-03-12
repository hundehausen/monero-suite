import { SimpleGrid, TextInput, Title } from "@mantine/core";
import { BootstrapNodeSectionProps } from "./types";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const BootstrapNodeSection = ({ stateFunctions, bootstrapDaemonAddress }: BootstrapNodeSectionProps) => {
  const {
    bootstrapDaemonAddress: address,
    setBootstrapDaemonAddress,
    bootstrapDaemonLogin,
    setBootstrapDaemonLogin,
  } = stateFunctions;

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
              explanation="Use a remote daemon while syncing your local blockchain. Useful for quick wallet access during initial sync. Format: host:port"
            />
          }
          value={address}
          onChange={(e) => setBootstrapDaemonAddress(e.currentTarget.value)}
          placeholder="node.example.org:18089"
        />
        {address && (
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
