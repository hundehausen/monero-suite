import { SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const StorageSection = () => {
  const {
    isMoneroMainnetVolume,
    setIsMoneroMainnetVolume,
    moneroMainnetBlockchainLocation,
    setMoneroMainnetBlockchainLocation,
    isPrunedNode,
    setIsPrunedNode,
    isSyncPrunedBlocks,
    setIsSyncPrunedBlocks,
  } = useMonerodState();

  const blockchainLocationError = (): string | null => {
    if (!moneroMainnetBlockchainLocation) return null;
    if (!moneroMainnetBlockchainLocation.startsWith("/") && !moneroMainnetBlockchainLocation.startsWith("~"))
      return "Path must be absolute (e.g. /mnt/data/monero or ~/.bitmonero)";
    return null;
  };

  return (
    <AccordionItemComponent
      value="storage"
      title={<Title order={4}>Storage</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <Switch
          label={
            <ExplainingLabel
              label="Use Default Blockchain Location"
              explanation="When enabled, the blockchain data will be stored in the default location (~/.bitmonero). Disable to specify a custom location."
            />
          }
          checked={isMoneroMainnetVolume}
          onChange={(event) => setIsMoneroMainnetVolume(event.currentTarget.checked)}
        />
        {!isMoneroMainnetVolume && (
          <TextInput
            label={
              <ExplainingLabel
                label="Custom Blockchain Location"
                explanation="The full path where the Monero blockchain will be stored. This should be a location with sufficient disk space."
              />
            }
            value={moneroMainnetBlockchainLocation}
            onChange={(e) => setMoneroMainnetBlockchainLocation(e.currentTarget.value)}
            placeholder="~/.bitmonero"
            error={blockchainLocationError()}
          />
        )}
        <Switch
          label={
            <ExplainingLabel
              label="Pruned Node"
              explanation="Pruning allows saving 2/3 of storage space while keeping the full transaction history. There are no privacy or security downsides."
            />
          }
          checked={isPrunedNode}
          onChange={(event) => setIsPrunedNode(event.currentTarget.checked)}
        />
        {isPrunedNode && (
          <Switch
            label={
              <ExplainingLabel
                label="Sync Pruned Blocks"
                explanation="Accept pruned blocks from peers during sync. Reduces network bandwidth but requires --prune-blockchain to be enabled."
              />
            }
            checked={isSyncPrunedBlocks}
            onChange={(event) => setIsSyncPrunedBlocks(event.currentTarget.checked)}
          />
        )}
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default StorageSection;
