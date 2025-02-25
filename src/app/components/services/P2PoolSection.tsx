import { MiningMode, P2PoolMode } from "@/hooks/use-services";
import {
  Accordion,
  Box,
  Input,
  SegmentedControl,
  Slider,
  Text,
} from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";
import ExplainingLabel from "../ExplainingLabel";

const P2PoolSection = ({ services, stateFunctions }: ServiceComponentProps) => {
  const {
    p2PoolMode,
    setP2PoolMode,
    p2PoolPayoutAddress,
    setP2PoolPayoutAddress,
    p2PoolMiningThreads,
    setP2PoolMiningThreads,
    miningMode,
    setMiningMode,
    architecture,
  } = stateFunctions;

  const p2poolPayoutAddressError = () => {
    if (p2PoolPayoutAddress.length === 0) return null;
    if (p2PoolPayoutAddress.length < 95) return "Address too short";
    if (p2PoolPayoutAddress.length > 95) return "Address too long";
    if (!p2PoolPayoutAddress.startsWith("4"))
      return "Address must start with 4. Subaddresses are not supported by P2Pool.";
    return null;
  };

  return (
    <Accordion.Item value="p2pool">
      <Accordion.Control>
        <Text size="lg">P2Pool</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["p2pool"].description}</Text>
        <SegmentedControl
          value={p2PoolMode}
          onChange={(value) => setP2PoolMode(value as P2PoolMode)}
          styles={{
            label: {
              fontSize: "16px",
            },
          }}
          data={[
            {
              label: "None",
              value: "none",
            },
            {
              label: (
                <ExplainingLabel
                  label="P2Pool mini"
                  explanation="Use this if you have a low hashrate."
                />
              ),
              value: "mini",
            },
            {
              label: (
                <ExplainingLabel
                  label="P2Pool full"
                  explanation="Use this if you have a lot of hashrate."
                />
              ),
              value: "full",
            },
          ]}
        />
        {p2PoolMode !== "none" && (
          <>
            <Input.Wrapper
              styles={{
                root: {
                  width: "100%",
                },
              }}
              label="Monero Payout Address"
              description="It has to be a primary address. Subaddresses don't work."
              error={p2poolPayoutAddressError()}
            >
              <Input
                value={p2PoolPayoutAddress}
                onChange={(e) => setP2PoolPayoutAddress(e.currentTarget.value)}
              />
            </Input.Wrapper>
            <Text>CPU Mining</Text>
            <SegmentedControl
              value={miningMode}
              onChange={(value) => setMiningMode(value as MiningMode)}
              styles={{
                label: {
                  fontSize: "16px",
                },
              }}
              data={[
                {
                  label: "None",
                  value: "none",
                },
                {
                  label: "XMRig",
                  value: "xmrig",
                  disabled: architecture === "linux/arm64",
                },
                {
                  label: (
                    <ExplainingLabel
                      label="P2Pool"
                      explanation="The P2Pool software has a integrated CPU miner. XMRig might be more efficient."
                    />
                  ),
                  value: "p2pool",
                },
              ]}
            />
            {miningMode === "p2pool" && (
              <Box mx="auto" p={16}>
                <Slider
                  value={p2PoolMiningThreads}
                  onChange={setP2PoolMiningThreads}
                  defaultValue={1}
                  min={1}
                  max={32}
                  label={(value) =>
                    `${value} ${value > 1 ? `Threads` : `Thread`}`
                  }
                  thumbLabel="always"
                  step={1}
                  styles={{
                    root: {
                      width: "300px",
                    },
                  }}
                />
                <Text size="sm">{`${p2PoolMiningThreads} ${
                  p2PoolMiningThreads > 1 ? `Threads` : `Thread`
                }`}</Text>
              </Box>
            )}
          </>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default P2PoolSection;
