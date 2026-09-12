"use client";

import { MiningMode, P2PoolMode, networkModes, p2poolModes } from "@/hooks/use-services";
import {
  Alert,
  Box,
  Checkbox,
  Input,
  Radio,
  SegmentedControl,
  Slider,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useServicesContext, useP2PoolState, useXmrigState, useArchitectureState, useNetworkModeState } from "@/hooks/services-context";
import ExplainingLabel from "../ExplainingLabel";
import AccordionItemComponent from "./AccordionItemComponent";
import { MONERO_ADDRESS_BASE58, MONERO_PRIMARY_ADDRESS_PREFIX } from "@/lib/schemas";

const isP2PoolMode = (value: string): value is P2PoolMode =>
  value === p2poolModes.none ||
  value === p2poolModes.nano ||
  value === p2poolModes.mini ||
  value === p2poolModes.full;

const P2PoolSection = () => {
  const { services } = useServicesContext();
  const {
    p2PoolMode,
    setP2PoolMode,
    p2PoolPayoutAddress,
    setP2PoolPayoutAddress,
    p2PoolMiningThreads,
    setP2PoolMiningThreads,
    isP2PoolStratumPublic,
    setIsP2PoolStratumPublic,
  } = useP2PoolState();
  const { miningMode, setMiningMode } = useXmrigState();
  const { architecture } = useArchitectureState();
  const { networkMode } = useNetworkModeState();
  const isExposed = networkMode === networkModes.exposed;

  const p2poolPayoutAddressError = () => {
    if (p2PoolPayoutAddress.length === 0) return null;
    if (p2PoolPayoutAddress.length !== 95)
      return `Monero address must be exactly 95 characters (currently ${p2PoolPayoutAddress.length})`;
    if (!p2PoolPayoutAddress.startsWith(MONERO_PRIMARY_ADDRESS_PREFIX))
      return "Must be a primary address starting with 4 — subaddresses are not supported by P2Pool";
    if ([...p2PoolPayoutAddress].some((c) => !MONERO_ADDRESS_BASE58.includes(c)))
      return "Contains invalid characters — 0, O, I and l are not valid in Monero addresses";
    return null;
  };

  return (
    <AccordionItemComponent
      value="p2pool"
      title="P2Pool"
      checked={p2PoolMode !== "none"}
    >
      <Text size="sm">{services["p2pool"].description}</Text>
      <Radio.Group
        value={p2PoolMode}
        onChange={(value) => {
          if (isP2PoolMode(value)) setP2PoolMode(value);
        }}
        label="P2Pool network"
      >
        <Stack gap="xs" mt="xs">
          <Radio value={p2poolModes.none} label="None" />
          <Radio
            value={p2poolModes.nano}
            label={
              <ExplainingLabel
                label="P2Pool nano"
                explanation="Smallest P2Pool network — best for low-power devices and very low hashrate miners."
              />
            }
          />
          <Radio
            value={p2poolModes.mini}
            label={
              <ExplainingLabel
                label="P2Pool mini"
                explanation="Smaller pool with lower variance — a good starting point for most home miners."
              />
            }
          />
          <Radio
            value={p2poolModes.full}
            label={
              <ExplainingLabel
                label="P2Pool full"
                explanation="Main P2Pool network — best suited for miners with higher hashrate."
              />
            }
          />
        </Stack>
      </Radio.Group>
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
            withAsterisk
          >
            <Input
              value={p2PoolPayoutAddress}
              onChange={(e) => setP2PoolPayoutAddress(e.currentTarget.value)}
            />
          </Input.Wrapper>
          {isExposed && (
            <Checkbox
              mt="md"
              checked={isP2PoolStratumPublic}
              label={
                <ExplainingLabel
                  label="Allow external miners (expose stratum publicly)"
                  explanation="Anyone who can reach port 3333 on this host can point miners at your stratum. Only enable this if you want to let external miners connect. In-container miners (XMRig) and other devices on your local network reach the stratum without it."
                />
              }
              onChange={(event) => setIsP2PoolStratumPublic(event.currentTarget.checked)}
            />
          )}
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
                label: (
                  <Tooltip
                    label="XMRig does not have ARM64 builds. Use P2Pool's built-in miner instead."
                    disabled={architecture !== "linux/arm64"}
                  >
                    <span>XMRig</span>
                  </Tooltip>
                ),
                value: "xmrig",
                disabled: architecture === "linux/arm64",
              },
              {
                label: (
                  <ExplainingLabel
                    label="P2Pool"
                    explanation="P2Pool includes a built-in CPU miner. XMRig may perform better on some hardware."
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
