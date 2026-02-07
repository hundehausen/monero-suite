import { NumberInput, SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const MiningSection = () => {
  const {
    startMining,
    setStartMining,
    miningThreads,
    setMiningThreads,
    bgMiningEnable,
    setBgMiningEnable,
    bgMiningIgnoreBattery,
    setBgMiningIgnoreBattery,
  } = useMonerodState();

  return (
    <AccordionItemComponent
      value="mining"
      title={<Title order={4}>Solo Mining</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <TextInput
          label={
            <ExplainingLabel
              label="Start Mining to Address"
              explanation="Start mining to the specified Monero address. If provided, the node will begin mining upon startup. Alternatively you can choose P2Pool Mining as another service."
            />
          }
          value={startMining}
          onChange={(e) => setStartMining(e.currentTarget.value)}
          placeholder="44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A"
        />
        {startMining && (
          <NumberInput
            label={
              <ExplainingLabel
                label="Mining Threads"
                explanation="Number of CPU threads to use for mining. Default is 1."
              />
            }
            value={parseInt(miningThreads)}
            onChange={(value) => setMiningThreads(String(value))}
            min={1}
            max={32}
          />
        )}
        <Switch
          label={
            <ExplainingLabel
              label="Enable Background Mining"
              explanation="Mine when the system is idle and stop when the system is being used."
            />
          }
          checked={bgMiningEnable}
          onChange={(event) => setBgMiningEnable(event.currentTarget.checked)}
        />
        {bgMiningEnable && (
          <Switch
            label={
              <ExplainingLabel
                label="Background Mining Ignore Battery"
                explanation="Assume plugged in when battery status is unknown. Background mining will not pause on systems where power status cannot be detected."
              />
            }
            checked={bgMiningIgnoreBattery}
            onChange={(event) => setBgMiningIgnoreBattery(event.currentTarget.checked)}
          />
        )}
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default MiningSection;
