import { Accordion, SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { StorageSectionProps } from "./types";
import ExplainingLabel from "../../ExplainingLabel";

const StorageSection = ({ stateFunctions, isPrunedNode }: StorageSectionProps) => {
  const {
    isMoneroMainnetVolume,
    setIsMoneroMainnetVolume,
    moneroMainnetBlockchainLocation,
    setMoneroMainnetBlockchainLocation,
    isPrunedNode: pruned,
    setIsPrunedNode,
    isSyncPrunedBlocks,
    setIsSyncPrunedBlocks,
  } = stateFunctions;

  return (
    <Accordion.Item value="storage">
      <Accordion.Control>
        <Title order={4}>Storage</Title>
      </Accordion.Control>
      <Accordion.Panel>
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
            />
          )}
          <Switch
            label={
              <ExplainingLabel
                label="Pruned Node"
                explanation="Pruning allows saving 2/3 of storage space while keeping the full transaction history. There are no privacy or security downsides."
              />
            }
            checked={pruned}
            onChange={(event) => setIsPrunedNode(event.currentTarget.checked)}
          />
          {pruned && (
            <Switch
              label={
                <ExplainingLabel
                  label="Sync Pruned Blocks"
                  explanation="Download only pruned blocks instead of full blocks. Saves network bandwidth during synchronization."
                />
              }
              checked={isSyncPrunedBlocks}
              onChange={(event) => setIsSyncPrunedBlocks(event.currentTarget.checked)}
            />
          )}
        </SimpleGrid>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default StorageSection;
