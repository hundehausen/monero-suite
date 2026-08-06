"use client";

import { NumberInput, SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { useMonerodState, useServicesContext } from "@/hooks/services-context";
import { p2poolModes } from "@/hooks/services";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const RpcZmqSection = () => {
  const {
    rpcLogin,
    setRpcLogin,
    disableRpcBan,
    setDisableRpcBan,
    zmqPubEnabled,
    setZmqPubEnabled,
    zmqPubBindPort,
    setZmqPubBindPort,
  } = useMonerodState();

  const { stateFunctions: s } = useServicesContext();

  // P2Pool and Monitoring require the ZMQ feed, so the switch is forced on
  // while either is enabled. Display is derived; zmqPubEnabled stays user-set.
  const needsZmq = s.p2PoolMode !== p2poolModes.none || s.isMonitoring;
  const zmqEffectivelyOn = zmqPubEnabled || needsZmq;

  return (
    <AccordionItemComponent
      value="rpc_zmq"
      title={<Title order={4}>RPC/ZMQ</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <TextInput
          label={
            <ExplainingLabel
              label="RPC Login"
              explanation="Require username:password authentication for the RPC server. All RPC clients must provide these credentials."
            />
          }
          value={rpcLogin}
          onChange={(e) => setRpcLogin(e.currentTarget.value)}
          placeholder="username:password"
        />
        <Switch
          label={
            <ExplainingLabel
              label="Disable RPC Ban"
              explanation="Don't automatically ban hosts that trigger RPC errors. Recommended when using Tor, since Tor exit nodes may share IPs and an unfair ban could block legitimate wallets."
            />
          }
          checked={disableRpcBan}
          onChange={(event) => setDisableRpcBan(event.currentTarget.checked)}
        />
        <Switch
          label={
            <ExplainingLabel
              label="Enable ZMQ Publisher"
              explanation={
                needsZmq
                  ? "Required by P2Pool / Monitoring — cannot be disabled while either is enabled."
                  : "ZMQ interface enables applications to subscribe to node events like new blocks or transactions."
              }
            />
          }
          checked={zmqEffectivelyOn}
          disabled={needsZmq}
          onChange={(event) => setZmqPubEnabled(event.currentTarget.checked)}
        />
        {zmqEffectivelyOn && (
          <NumberInput
            label={
              <ExplainingLabel
                label="ZMQ Publisher Port"
                explanation="Port for the ZMQ publisher. Default is 18083."
              />
            }
            value={parseInt(zmqPubBindPort)}
            onChange={(value) => setZmqPubBindPort(String(value))}
            min={1025}
            max={65535}
          />
        )}
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default RpcZmqSection;
