import { ServiceComponentProps, panelStyles } from "./types";
import {
  Accordion,
  Anchor,
  Checkbox,
  Input,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import ExplainingLabel from "../ExplainingLabel";

const MoneroNodeSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const {
    isMoneroPublicNode,
    setIsMoneroPublicNode,
    moneroNodeNoLogs,
    setMoneroNodeNoLogs,
    moneroNodeDomain,
    setMoneroNodeDomain,
    isPrunedNode,
    setIsPrunedNode,
    isSyncPrunedBlocks,
    setIsSyncPrunedBlocks,
    isMoneroMainnetVolume,
    setIsMoneroMainnetVolume,
    moneroMainnetBlockchainLocation,
    setMoneroMainnetBlockchainLocation,
    isTraefik,
  } = stateFunctions;

  return (
    <Accordion.Item value="mainnet-node">
      <Accordion.Control>
        <Text size="lg">Monero Node</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["monerod"].description}</Text>
        <Switch
          checked={isMoneroPublicNode}
          label="Monero Node"
          labelPosition="left"
          onChange={(event) =>
            setIsMoneroPublicNode(event.currentTarget.checked)
          }
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
      keeping the full transaction hisHiddenServicesy. Pruning works by removing 7/8
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
        {isPrunedNode && (
          <>
            <Text size="sm">
              Activating to sync pruned blocks will save your network bandwith.
              You download only the pruned blocks instead of downloading the
              full blocks and pruning them afterwards.
            </Text>
            <Checkbox
              checked={isSyncPrunedBlocks}
              label="Sync Pruned Blocks"
              labelPosition="left"
              size="lg"
              onChange={(event) =>
                setIsSyncPrunedBlocks(event.currentTarget.checked)
              }
            />
          </>
        )}
        <Checkbox
          checked={!isMoneroMainnetVolume}
          label="Custom location for Monero mainnet blockchain"
          labelPosition="left"
          size="md"
          onChange={(event) =>
            setIsMoneroMainnetVolume(!event.currentTarget.checked)
          }
        ></Checkbox>
        {!isMoneroMainnetVolume && (
          <Input.Wrapper
            styles={{
              root: {
                width: "100%",
              },
            }}
            description="The location where the monero blockchain will be stored."
          >
            <TextInput
              value={moneroMainnetBlockchainLocation}
              onChange={(e) =>
                setMoneroMainnetBlockchainLocation(e.currentTarget.value)
              }
            />
          </Input.Wrapper>
        )}
        <Checkbox
          checked={moneroNodeNoLogs}
          label="Disable Monero Node logging"
          labelPosition="left"
          size="md"
          onChange={(event) => setMoneroNodeNoLogs(event.currentTarget.checked)}
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
        <Anchor
          href="https://getmonero.dev/interacting/monerod#options"
          target="_blank"
          fw={400}
          fz="sm"
        >
          All monerod options explained
        </Anchor>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default MoneroNodeSection;
