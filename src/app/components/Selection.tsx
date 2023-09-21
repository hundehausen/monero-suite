import { ServiceMap, useServices } from "@/hooks/use-services";
import {
  Checkbox,
  Stack,
  Switch,
  SegmentedControl,
  Input,
  Slider,
  Text,
} from "@mantine/core";

interface SelectionProps {
  services: ServiceMap;
  stateFunctions: ReturnType<typeof useServices>["stateFunctions"];
}

const Selection = ({ services, stateFunctions }: SelectionProps) => {
  const {
    isMoneroPublicNode,
    setIsMoneroPublicNode,
    p2PoolMode,
    setP2PoolMode,
    p2PoolPayoutAddress,
    setP2PoolPayoutAddress,
    p2PoolMiningThreads,
    setP2PoolMiningThreads,
    isTor,
    setIsTor,
    isWatchtower,
    setIsWatchtower,
    isMoneroblock,
    setIsMoneroblock,
    isAutoheal,
    setIsAutoheal,
    isPrunedNode,
    setIsPrunedNode,
  } = stateFunctions;

  const p2poolPayoutAddressError = () => {
    if (p2PoolPayoutAddress.length === 0) return null;
    if (p2PoolPayoutAddress.length < 95) return "Address too short";
    if (p2PoolPayoutAddress.length > 95) return "Address too long";
    if (p2PoolPayoutAddress[0] !== "4")
      return "Address must start with 4. Subaddresses are not supported by P2Pool.";
    return null;
  };

  return (
    <Stack>
      <Switch
        checked={isMoneroPublicNode}
        label={<span title={services["monerod"].description}>Monero Node</span>}
        labelPosition="left"
        onChange={(event) => setIsMoneroPublicNode(event.currentTarget.checked)}
        onLabel="Public"
        offLabel="Private"
        size="lg"
      />
      <Switch
        checked={isPrunedNode}
        label={<span>Pruned Node</span>}
        labelPosition="left"
        onChange={(event) => setIsPrunedNode(event.currentTarget.checked)}
        onLabel="Pruned"
        offLabel="Full"
        size="lg"
      />
      <SegmentedControl
        value={p2PoolMode}
        onChange={setP2PoolMode}
        title={services["p2pool"].description}
        data={[
          {
            label: "None",
            value: "none",
          },
          { label: "P2Pool mini", value: "mini" },
          { label: "P2Pool full", value: "full" },
        ]}
      />
      {p2PoolMode !== "none" && (
        <>
          <Input.Wrapper
            label="Monero Payout Address"
            description="It has to be a primary address. Subaddresses don't work."
            error={p2poolPayoutAddressError()}
          >
            <Input
              value={p2PoolPayoutAddress}
              onChange={(e) => setP2PoolPayoutAddress(e.currentTarget.value)}
            />
          </Input.Wrapper>
          <Text>Integrated P2Pool Mining</Text>
          <Slider
            value={p2PoolMiningThreads}
            onChange={setP2PoolMiningThreads}
            defaultValue={0}
            min={0}
            max={16}
            label={(value) => value + " threads"}
            thumbLabel="always"
            step={1}
          />
          <Text size="sm">
            {p2PoolMiningThreads > 0
              ? `${p2PoolMiningThreads} Threads`
              : `No mining`}
          </Text>
        </>
      )}
      <Checkbox
        checked={isMoneroblock}
        label="Moneroblock"
        labelPosition="left"
        title={services["moneroblock"].description}
        size="lg"
        onChange={(event) => setIsMoneroblock(event.currentTarget.checked)}
      />
      <Checkbox
        checked={isTor}
        label="Tor"
        labelPosition="left"
        title={services["tor"].description}
        size="lg"
        onChange={(event) => setIsTor(event.currentTarget.checked)}
      />
      <Checkbox
        checked={isWatchtower}
        label="Watchtower"
        labelPosition="left"
        title={services["watchtower"].description}
        size="lg"
        onChange={(event) => setIsWatchtower(event.currentTarget.checked)}
      />
      <Checkbox
        checked={isAutoheal}
        label="Autoheal"
        labelPosition="left"
        title={services["autoheal"].description}
        size="lg"
        onChange={(event) => setIsAutoheal(event.currentTarget.checked)}
      />
    </Stack>
  );
};

export default Selection;
