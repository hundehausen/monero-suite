import { SimpleGrid, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const NotificationsSection = () => {
  const {
    blockNotify,
    setBlockNotify,
    reorgNotify,
    setReorgNotify,
    blockRateNotify,
    setBlockRateNotify,
  } = useMonerodState();

  return (
    <AccordionItemComponent
      value="notifications"
      title={<Title order={4}>Notifications</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <TextInput
          label={
            <ExplainingLabel
              label="Block Notify Command"
              explanation="Command to execute when a new block is added to the chain. Use %s as placeholder for the block hash."
            />
          }
          value={blockNotify}
          onChange={(e) => setBlockNotify(e.currentTarget.value)}
          placeholder="/path/to/script.sh %s"
        />
        <TextInput
          label={
            <ExplainingLabel
              label="Reorg Notify Command"
              explanation="Command to execute when a reorg is detected. Use placeholders: %s (common ancestor block hash), %h (height of common ancestor), %n (number of new blocks in new fork), %d (depth of reorg)."
            />
          }
          value={reorgNotify}
          onChange={(e) => setReorgNotify(e.currentTarget.value)}
          placeholder="/path/to/script.sh %s %h %n %d"
        />
        <TextInput
          label={
            <ExplainingLabel
              label="Block Rate Notify Command"
              explanation="Command to execute when an abnormal block rate is detected (possible attack or network issue). Placeholders: %t (seconds since last block), %b (number of blocks in last interval), %e (estimated seconds to next block)."
            />
          }
          value={blockRateNotify}
          onChange={(e) => setBlockRateNotify(e.currentTarget.value)}
          placeholder="/path/to/script.sh %t %b %e"
        />
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default NotificationsSection;
