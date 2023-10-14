import {
  P2PoolModes,
  ServiceMap,
  TorProxyModes,
  useServices,
} from "@/hooks/use-services";
import {
  Checkbox,
  Switch,
  SegmentedControl,
  Input,
  Slider,
  Text,
  Accordion,
  AccordionStylesNames,
  Code,
} from "@mantine/core";
import ExplainingLabel from "./ExplainingLabel";
import { CSSProperties, useEffect, useState } from "react";

const panelStyles = {
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
} as Partial<Record<AccordionStylesNames, CSSProperties>>;

interface SelectionProps {
  services: ServiceMap;
  stateFunctions: ReturnType<typeof useServices>["stateFunctions"];
}

const Selection = ({ services, stateFunctions }: SelectionProps) => {
  const {
    isMoneroPublicNode,
    setIsMoneroPublicNode,
    moneroNodeDomain,
    setMoneroNodeDomain,
    isPrunedNode,
    setIsPrunedNode,
    isSyncPrunedBlocks,
    setIsSyncPrunedBlocks,
    isStagenetNode,
    setIsStagenetNode,
    isStagenetNodePublic,
    setIsStagenetNodePublic,
    stagenetNodeDomain,
    setStagenetNodeDomain,
    isMoneroWalletRpc,
    setIsMoneroWalletRpc,
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
    moneroBlockDomain,
    setMoneroBlockDomain,
    isMoneroblockLogging,
    setIsMoneroblockLogging,
    isOnionMoneroBlockchainExplorer,
    setIsOnionMoneroBlockchainExplorer,
    onionMoneroBlockchainExplorerDomain,
    setOnionMoneroBlockchainExplorerDomain,
    isMonitoring,
    setIsMonitoring,
    grafanaDomain,
    setGrafanaDomain,
    torProxyMode,
    setTorProxyMode,
    isHiddenServices,
    setIsHiddenServices,
    isWatchtower,
    setIsWatchtower,
    isAutoheal,
    setIsAutoheal,
    isTraefik,
    setIsTraefik,
  } = stateFunctions;
  const [accordionItems, setAccordionItems] = useState(["mainnet-node"]);

  const p2poolPayoutAddressError = () => {
    if (p2PoolPayoutAddress.length === 0) return null;
    if (p2PoolPayoutAddress.length < 95) return "Address too short";
    if (p2PoolPayoutAddress.length > 95) return "Address too long";
    if (p2PoolPayoutAddress[0] !== "4")
      return "Address must start with 4. Subaddresses are not supported by P2Pool.";
    return null;
  };

  useEffect(() => {
    if (isTraefik) {
      setAccordionItems((items) => [
        ...items,
        ...(isMoneroPublicNode ? ["monero-node"] : []),
        ...(isStagenetNode && isStagenetNodePublic ? ["stagenet-node"] : []),
        ...(isMoneroblock ? ["moneroblock"] : []),
        ...(isMonitoring ? ["monitoring"] : []),
      ]);
    }
  }, [
    isMoneroPublicNode,
    isMoneroblock,
    isMonitoring,
    isStagenetNode,
    isStagenetNodePublic,
    isTraefik,
  ]);

  return (
    <Accordion
      multiple
      value={accordionItems}
      onChange={setAccordionItems}
      defaultValue={["mainnet-node"]}
      styles={{
        panel: {
          paddingTop: "8px",
        },
      }}
    >
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
                Activating to sync pruned blocks will save your network
                bandwith. You download only the pruned blocks instead of
                downloading the full blocks and pruning them afterwards.
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
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="stagenet-node">
        <Accordion.Control>
          <Text size="lg">Monero Stagenet Node</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["monerod-stagenet"].description}</Text>
          <Checkbox
            checked={isStagenetNode}
            label="Monero Stagenet Node"
            labelPosition="left"
            size="lg"
            onChange={(event) => setIsStagenetNode(event.currentTarget.checked)}
          />
          {isStagenetNode && (
            <>
              <Switch
                checked={isStagenetNodePublic}
                label="Stagenet Node"
                labelPosition="left"
                onChange={(event) =>
                  setIsStagenetNodePublic(event.currentTarget.checked)
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
              {isStagenetNodePublic && isTraefik && (
                <Input.Wrapper
                  styles={{
                    root: {
                      width: "100%",
                    },
                  }}
                  label="Stagenet Node Domain"
                  description="The domain where your stagenet node will be available."
                >
                  <Input
                    value={stagenetNodeDomain}
                    onChange={(e) =>
                      setStagenetNodeDomain(e.currentTarget.value)
                    }
                  />
                </Input.Wrapper>
              )}
            </>
          )}
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="monero-wallet-rpc">
        <Accordion.Control>
          <Text size="lg">Monero Wallet RPC</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["monero-wallet-rpc"].description}</Text>
          <Checkbox
            checked={isMoneroWalletRpc}
            label="Monero Wallet RPC"
            labelPosition="left"
            size="lg"
            onChange={(event) =>
              setIsMoneroWalletRpc(event.currentTarget.checked)
            }
          />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="traefik">
        <Accordion.Control>
          <Text size="lg">Traefik Reverse Proxy</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["traefik"].description}</Text>
          <Checkbox
            checked={isTraefik}
            label="Traefik"
            labelPosition="left"
            size="lg"
            onChange={(event) => setIsTraefik(event.currentTarget.checked)}
          />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="p2pool">
        <Accordion.Control>
          <Text size="lg">P2Pool</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["p2pool"].description}</Text>
          <SegmentedControl
            value={p2PoolMode}
            onChange={(value) => setP2PoolMode(value as P2PoolModes)}
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
                  onChange={(e) =>
                    setP2PoolPayoutAddress(e.currentTarget.value)
                  }
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
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="moneroblock">
        <Accordion.Control>
          <Text size="lg">Moneroblock - block explorer</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["moneroblock"].description}</Text>
          <Checkbox
            checked={isMoneroblock}
            label="Moneroblock"
            labelPosition="left"
            size="lg"
            onChange={(event) => setIsMoneroblock(event.currentTarget.checked)}
          />
          {isMoneroblock && (
            <Checkbox
              checked={!isMoneroblockLogging}
              label="Disable Moneroblock logging for more privacy"
              labelPosition="left"
              size="md"
              onChange={(event) =>
                setIsMoneroblockLogging(!event.currentTarget.checked)
              }
              styles={{
                label: {
                  fontSize: "12px",
                },
              }}
            />
          )}
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
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="tor-proxy">
        <Accordion.Control>
          <Text size="lg">Tor Proxy</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["tor-proxy"].description}</Text>
          <SegmentedControl
            value={torProxyMode}
            onChange={(value) => setTorProxyMode(value as TorProxyModes)}
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
                    label="Tx only"
                    explanation="Use this to send transactions of directly connected wallets via Tor. Other traffic will not be routed through Tor."
                  />
                ),
                value: "tx-only",
              },
              {
                label: (
                  <ExplainingLabel
                    label="Full"
                    explanation="Use this to route all traffic through Tor. P2Pool will use this as well."
                  />
                ),
                value: "full",
                disabled: true,
              },
            ]}
          />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="tor-hidden-service">
        <Accordion.Control>
          <Text size="lg">Tor hidden service</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["tor-hidden-service"].description}</Text>
          <Checkbox
            checked={isHiddenServices}
            label="Tor Hidden Services"
            labelPosition="left"
            size="lg"
            onChange={(event) =>
              setIsHiddenServices(event.currentTarget.checked)
            }
          />
          <Text size="sm">
            Use <Code>docker logs tor-hidden-service</Code> to get generated
            onion addresses, after the container has started.
          </Text>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="monitoring">
        <Accordion.Control>
          <Text size="lg">Monitoring</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["monitoring"].description}</Text>
          <Checkbox
            checked={isMonitoring}
            label="Monitoring"
            labelPosition="left"
            size="lg"
            onChange={(event) => setIsMonitoring(event.currentTarget.checked)}
          />
          {isMonitoring === true && (
            <>
              <Input.Wrapper
                label="Grafana Hostname"
                description="The domain where your grafana dashboard will be available."
              >
                <Input
                  value={grafanaDomain}
                  onChange={(e) => setGrafanaDomain(e.currentTarget.value)}
                />
              </Input.Wrapper>
            </>
          )}
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="watchtower">
        <Accordion.Control>
          <Text size="lg">Watchtower</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["watchtower"].description}</Text>
          <Checkbox
            checked={isWatchtower}
            label="Watchtower"
            labelPosition="left"
            size="lg"
            onChange={(event) => setIsWatchtower(event.currentTarget.checked)}
          />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="autoheal">
        <Accordion.Control>
          <Text size="lg">Autoheal</Text>
        </Accordion.Control>
        <Accordion.Panel styles={panelStyles}>
          <Text size="sm">{services["autoheal"].description}</Text>
          <Checkbox
            checked={isAutoheal}
            label="Autoheal"
            labelPosition="left"
            size="lg"
            onChange={(event) => setIsAutoheal(event.currentTarget.checked)}
          />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default Selection;
