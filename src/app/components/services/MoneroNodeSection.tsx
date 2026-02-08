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
        label="Node Visibility"
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
            label="Storage Mode"
            explanation="Pruning reduces blockchain storage by 2/3 while keeping the full transaction history. Your node stays fully functional with no privacy or security trade-offs."
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
