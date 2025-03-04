import { Accordion, NumberInput, SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { MiningSectionProps } from "./types";
import ExplainingLabel from "../../ExplainingLabel";

const MiningSection = ({ stateFunctions, startMining, bgMiningEnable }: MiningSectionProps) => {
  const {
    startMining: mining,
    setStartMining,
    miningThreads,
    setMiningThreads,
    bgMiningEnable: bgMining,
    setBgMiningEnable,
    bgMiningIgnoreBattery,
    setBgMiningIgnoreBattery,
  } = stateFunctions;

  return (
    <Accordion.Item value="mining">
      <Accordion.Control>
        <Title order={4}>Solo Mining</Title>
      </Accordion.Control>
      <Accordion.Panel>
        <SimpleGrid cols={1} spacing="md">
          <TextInput
            label={
              <ExplainingLabel
                label="Start Mining to Address"
                explanation="Start mining to the specified Monero address. If provided, the node will begin mining upon startup. Alternatively you can choose P2Pool Mining as another service."
              />
            }
            value={mining}
            onChange={(e) => setStartMining(e.currentTarget.value)}
            placeholder="44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A"
          />
          {mining && (
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
            checked={bgMining}
            onChange={(event) => setBgMiningEnable(event.currentTarget.checked)}
          />
          {bgMining && (
            <Switch
              label={
                <ExplainingLabel
                  label="Background Mining Ignore Battery"
                  explanation="If enabled, background mining will continue even when running on battery power."
                />
              }
              checked={bgMiningIgnoreBattery}
              onChange={(event) => setBgMiningIgnoreBattery(event.currentTarget.checked)}
            />
          )}
        </SimpleGrid>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default MiningSection;
