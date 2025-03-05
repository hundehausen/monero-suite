import { ServiceComponentProps, panelStyles } from "./types";
import {
  Accordion,
  Anchor,
  Button,
  Group,
  Input,
  Switch,
  Text,
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import ExplainingLabel from "../ExplainingLabel";
import AdvancedConfigModal from "./MoneroNode/AdvancedConfigModal";

const MoneroNodeSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const {
    isMoneroPublicNode,
    setIsMoneroPublicNode,
    moneroNodeDomain,
    setMoneroNodeDomain,
    isPrunedNode,
    setIsPrunedNode,
    isTraefik
  } = stateFunctions;

  // State for modal
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Accordion.Item value="mainnet-node">
      <Accordion.Control>
        <Text size="lg">Monero Node</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["monerod"].description}</Text>
        <Switch
          checked={isMoneroPublicNode}
          label="Monero Node"
          labelPosition="left"
          onChange={(event) =>
            setIsMoneroPublicNode(event.currentTarget.checked)
          }
          onLabel="Public"
          offLabel="Private"
          size="lg"
          styles={{
            track: {
              width: "70px",
            },
          }}
        />
        <Switch
          checked={isPrunedNode}
          label={
            <ExplainingLabel
              label="Pruned Node"
              explanation="Pruning allows node operators to save 2/3 of storage space while
      keeping the full transaction hisHiddenServicesy. Pruning works by removing 7/8
      of unnecessary ring signature data. There are no privacy or security
      downsides when using a pruned node."
            />
          }
          labelPosition="left"
          onChange={(event) => setIsPrunedNode(event.currentTarget.checked)}
          onLabel="Pruned"
          offLabel="Full"
          size="lg"
          styles={{
            track: {
              width: "70px",
            },
          }}
        />

        {isMoneroPublicNode && isTraefik && (
          <>
            <Input.Wrapper
              styles={{
                root: {
                  width: "100%",
                },
              }}
              label="Monero Node Domain"
              description="The domain where your monero node will be available."
            >
              <Input
                value={moneroNodeDomain}
                onChange={(e) => setMoneroNodeDomain(e.currentTarget.value)}
              />
            </Input.Wrapper>
            {moneroNodeDomain && (
              <Text size="sm">{`Connect to your remote node from any wallet. Enter ${moneroNodeDomain}:443`}</Text>
            )}
          </>
        )}
        
        {/* Advanced Configuration Button */}
        <Group mt="md">
          <Button onClick={open} variant="outline">Advanced Configuration</Button>
        </Group>
        
        {/* Advanced Configuration Modal */}
        <AdvancedConfigModal 
          opened={opened} 
          onClose={close} 
          stateFunctions={stateFunctions}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default MoneroNodeSection;
