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
import ExplainingLabel from "./ExplainingLabel";

interface SelectionProps {
  services: ServiceMap;
  stateFunctions: ReturnType<typeof useServices>["stateFunctions"];
}

const Selection = ({ services, stateFunctions }: SelectionProps) => {
  const {
    isMoneroPublicNode,
    setIsMoneroPublicNode,
    isPrunedNode,
    setIsPrunedNode,
    p2PoolMode,
    setP2PoolMode,
    p2PoolPayoutAddress,
    setP2PoolPayoutAddress,
    p2PoolMiningThreads,
    setP2PoolMiningThreads,
    isXmrig,
    setIsXmrig,
    isMoneroblock,
    setIsMoneroblock,
    isOnionMoneroBlockchainExplorer,
    setIsOnionMoneroBlockchainExplorer,
    isTor,
    setIsTor,
    isWatchtower,
    setIsWatchtower,
    isAutoheal,
    setIsAutoheal,
    isTraefik,
    setIsTraefik,
    moneroNodeDomain,
    setMoneroNodeDomain,
    moneroBlockDomain,
    setMoneroBlockDomain,
    onionMoneroBlockchainExplorerDomain,
    setOnionMoneroBlockchainExplorerDomain,
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
    <Stack
      styles={{
        root: {
          alignItems: "flex-end",
          width: "100%",
        },
      }}
    >
      <Switch
        checked={isMoneroPublicNode}
        label={
          <ExplainingLabel
            label="Monero Node"
            explanation={services["monerod"].description}
          />
        }
        labelPosition="left"
        onChange={(event) => setIsMoneroPublicNode(event.currentTarget.checked)}
        onLabel="Public"
        offLabel="Private"
        size="lg"
        styles={{
          track: {
            width: "70px",
          },
        }}
      />

      <Switch
        checked={isPrunedNode}
        label={
          <ExplainingLabel
            label="Pruned Node"
            explanation="Pruning allows node operators to save 2/3 of storage space while
        keeping the full transaction history. Pruning works by removing 7/8
        of unnecessary ring signature data. There are no privacy or security
        downsides when using a pruned node."
          />
        }
        labelPosition="left"
        onChange={(event) => setIsPrunedNode(event.currentTarget.checked)}
        onLabel="Pruned"
        offLabel="Full"
        size="lg"
        styles={{
          track: {
            width: "70px",
          },
        }}
      />
      <Checkbox
        checked={isTraefik}
        label={
          <ExplainingLabel
            label="Traefik"
            explanation={services["traefik"].description}
          />
        }
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsTraefik(event.currentTarget.checked)}
      />
      {isMoneroPublicNode && isTraefik && (
        <>
          <Input.Wrapper
            styles={{
              root: {
                width: "100%",
              },
            }}
            label="Monero Node Domain"
            description="The domain where your monero node will be available."
          >
            <Input
              value={moneroNodeDomain}
              onChange={(e) => setMoneroNodeDomain(e.currentTarget.value)}
            />
          </Input.Wrapper>
          {moneroNodeDomain && (
            <Text size="sm">{`Connect to your remote node from any wallet. Enter ${moneroNodeDomain}:443`}</Text>
          )}
        </>
      )}
      <SegmentedControl
        value={p2PoolMode}
        onChange={setP2PoolMode}
        data={[
          {
            label: "None",
            value: "none",
          },
          {
            label: (
              <ExplainingLabel
                label="P2Pool mini"
                explanation={services["p2pool"].description.concat(
                  " Use this if you have a low hashrate."
                )}
              />
            ),
            value: "mini",
          },
          {
            label: (
              <ExplainingLabel
                label="P2Pool full"
                explanation={services["p2pool"].description.concat(
                  " Use this if you have a lot of hashrate."
                )}
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
            styles={{
              root: {
                width: "100%",
                maxWidth: "300px",
              },
            }}
          />
          <Text size="sm">
            {p2PoolMiningThreads > 0
              ? `${p2PoolMiningThreads} Threads`
              : `No mining`}
          </Text>
        </>
      )}
      {/* <Checkbox
        checked={isXmrig}
        label="XMRig"
        labelPosition="left"
        title={services["xmrig"].description}
        size="lg"
        onChange={(event) => setIsXmrig(event.currentTarget.checked)}
      /> */}
      <Checkbox
        checked={isMoneroblock}
        label={
          <ExplainingLabel
            label="Moneroblock"
            explanation={services["moneroblock"].description}
          />
        }
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsMoneroblock(event.currentTarget.checked)}
      />
      {isMoneroblock && isTraefik && (
        <Input.Wrapper
          styles={{
            root: {
              width: "100%",
            },
          }}
          label="Moneroblock Domain"
          description="The domain where your moneroblock will be available."
        >
          <Input
            value={moneroBlockDomain}
            onChange={(e) => setMoneroBlockDomain(e.currentTarget.value)}
          />
        </Input.Wrapper>
      )}
      {/* <Checkbox
        checked={isOnionMoneroBlockchainExplorer}
        label={
          <ExplainingLabel
            label="Onion Monero Blockchain Explorer"
            explanation={services["onionMoneroBlockchainExplorer"].description}
          />
        }
        labelPosition="left"
        size="lg"
        onChange={(event) =>
          setIsOnionMoneroBlockchainExplorer(event.currentTarget.checked)
        }
      />
      {isOnionMoneroBlockchainExplorer && isTraefik && (
        <Input.Wrapper
          label="Onion Monero Blockchain Explorer Domain"
          description="The domain where your onion monero blockchain explorer will be available."
        >
          <Input
            value={onionMoneroBlockchainExplorerDomain}
            onChange={(e) =>
              setOnionMoneroBlockchainExplorerDomain(e.currentTarget.value)
            }
          />
        </Input.Wrapper>
      )} */}
      <Checkbox
        checked={isTor}
        label={
          <ExplainingLabel
            label="Tor"
            explanation={services["tor"].description}
          />
        }
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsTor(event.currentTarget.checked)}
      />
      <Checkbox
        checked={isWatchtower}
        label={
          <ExplainingLabel
            label="Watchtower"
            explanation={services["watchtower"].description}
          />
        }
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsWatchtower(event.currentTarget.checked)}
      />
      <Checkbox
        checked={isAutoheal}
        label={
          <ExplainingLabel
            label="Autoheal"
            explanation={services["autoheal"].description}
          />
        }
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsAutoheal(event.currentTarget.checked)}
      />
    </Stack>
  );
};

export default Selection;
