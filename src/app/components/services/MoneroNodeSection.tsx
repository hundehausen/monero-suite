import {
  Button,
  Group,
  Switch,
  Text,
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { useServicesContext, useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../ExplainingLabel";
import AdvancedConfigModal from "./MoneroNode/AdvancedConfigModal";
import AccordionItemComponent from "./AccordionItemComponent";

const MoneroNodeSection = () => {
  const { services } = useServicesContext();
  const {
    isMoneroPublicNode,
    setIsMoneroPublicNode,
    isPrunedNode,
    setIsPrunedNode,
  } = useMonerodState();

  // State for modal
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <AccordionItemComponent
      value="mainnet-node"
      title="Monero Node"
      checked
    >
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
    keeping the full transaction history. Pruning works by removing 7/8
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

      {/* Advanced Configuration Button */}
      <Group mt="md">
        <Button onClick={open} variant="outline">Advanced Configuration</Button>
      </Group>

      {/* Advanced Configuration Modal */}
      <AdvancedConfigModal
        opened={opened}
        onClose={close}
      />
    </AccordionItemComponent>
  );
};

export default MoneroNodeSection;
