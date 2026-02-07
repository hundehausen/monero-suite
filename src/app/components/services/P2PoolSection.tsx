import { MiningMode, P2PoolMode } from "@/hooks/use-services";
import {
  Alert,
  Box,
  Input,
  SegmentedControl,
  Slider,
  Text,
} from "@mantine/core";
import { useServicesContext, useP2PoolState, useXmrigState, useArchitectureState } from "@/hooks/services-context";
import ExplainingLabel from "../ExplainingLabel";
import AccordionItemComponent from "./AccordionItemComponent";

const P2PoolSection = () => {
  const { services } = useServicesContext();
  const {
    p2PoolMode,
    setP2PoolMode,
    p2PoolPayoutAddress,
    setP2PoolPayoutAddress,
    p2PoolMiningThreads,
    setP2PoolMiningThreads,
  } = useP2PoolState();
  const { miningMode, setMiningMode } = useXmrigState();
  const { architecture } = useArchitectureState();

  const p2poolPayoutAddressError = () => {
    if (p2PoolPayoutAddress.length === 0) return null;
    if (p2PoolPayoutAddress.length < 95) return "Address too short";
    if (p2PoolPayoutAddress.length > 95) return "Address too long";
    if (!p2PoolPayoutAddress.startsWith("4"))
      return "Address must start with 4. Subaddresses are not supported by P2Pool.";
    return null;
  };

  return (
    <AccordionItemComponent
      value="p2pool"
      title="P2Pool"
    >
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
                label="P2Pool nano"
                explanation="Use this if you have the lowest hashrate."
              />
            ),
            value: "nano",
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
          {p2PoolPayoutAddress.length === 0 && (
            <Alert variant="light" color="yellow" title="Payout Address Required">
              P2Pool requires a primary Monero address to receive mining payouts. Please enter your address below.
            </Alert>
          )}
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
    </AccordionItemComponent>
  );
};

export default P2PoolSection;
