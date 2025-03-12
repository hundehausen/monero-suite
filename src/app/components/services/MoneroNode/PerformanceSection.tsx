import { NumberInput, Select, SimpleGrid, Switch, Title } from "@mantine/core";
import { PerformanceSectionProps } from "./types";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const PerformanceSection = ({ stateFunctions }: PerformanceSectionProps) => {
  const {
    dbSyncMode,
    setDbSyncMode,
    fastBlockSync,
    setFastBlockSync,
    blockSyncSize,
    setBlockSyncSize,
    enforceCheckpointing,
    setEnforceCheckpointing,
    preparationThreads,
    setPreparationThreads,
    maxConcurrency,
    setMaxConcurrency,
    prepareForStaging,
    setPrepareForStaging,
    maxTxpoolWeight,
    setMaxTxpoolWeight,
  } = stateFunctions;

  return (
    <AccordionItemComponent
      value="performance"
      title={<Title order={4}>Performance</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <Select
          label={
            <ExplainingLabel
              label="DB Sync Mode"
              explanation="Set synchronization mode for the blockchain database. Fast is faster but uses more RAM. Safe is slower but more reliable."
            />
          }
          value={dbSyncMode}
          onChange={(value) => value && setDbSyncMode(value)}
          data={[
            { value: "safe", label: "Safe (Default)" },
            { value: "fast", label: "Fast" },
            { value: "fastest", label: "Fastest" },
          ]}
        />
        <Switch
          label={
            <ExplainingLabel
              label="Fast Block Sync"
              explanation="Sync up most of the way by using embedded, authenticated block hashes. Speeds up initial sync."
            />
          }
          checked={fastBlockSync}
          onChange={(event) => setFastBlockSync(event.currentTarget.checked)}
        />
        <NumberInput
          label={
            <ExplainingLabel
              label="Block Sync Size"
              explanation="Number of blocks to sync at once. Default is 0 (automatic)."
            />
          }
          value={parseInt(blockSyncSize)}
          onChange={(value) => setBlockSyncSize(String(value))}
          min={0}
          max={1000}
        />
        <Switch
          label={
            <ExplainingLabel
              label="Enforce DNS Checkpointing"
              explanation="If enabled, the node verifies its blockchain against the DNS checkpoints. Will roll back if the local copy doesn't match the checkpoint."
            />
          }
          checked={enforceCheckpointing}
          onChange={(event) => setEnforceCheckpointing(event.currentTarget.checked)}
        />
        <NumberInput
          label={
            <ExplainingLabel
              label="Block Preparation Threads"
              explanation="Number of threads to use for block preparation. Default is 4."
            />
          }
          value={parseInt(preparationThreads)}
          onChange={(value) => setPreparationThreads(String(value))}
          min={1}
          max={32}
        />
        <NumberInput
          label={
            <ExplainingLabel
              label="Max Concurrency"
              explanation="Maximum number of threads to use for parallel jobs. Default is 0 (use all available cores)."
            />
          }
          value={parseInt(maxConcurrency)}
          onChange={(value) => setMaxConcurrency(String(value))}
          min={0}
          max={128}
        />
        <Switch
          label={
            <ExplainingLabel
              label="Prepare For Staging"
              explanation="Prepare the daemon for use with network wide staging."
            />
          }
          checked={prepareForStaging}
          onChange={(event) => setPrepareForStaging(event.currentTarget.checked)}
        />
        <NumberInput
          label={
            <ExplainingLabel
              label="Max Transaction Pool Weight"
              explanation="Maximum transaction pool size in bytes. Default is ~618MB, but ~2.5GB (2684354560 bytes) is recommended for better performance with high transaction volumes."
            />
          }
          value={parseInt(maxTxpoolWeight)}
          onChange={(value) => setMaxTxpoolWeight(String(value))}
          min={0}
          step={1000000}
        />
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default PerformanceSection;
