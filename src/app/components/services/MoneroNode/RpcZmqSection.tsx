import { NumberInput, Select, SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { RpcZmqSectionProps } from "./types";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const RpcZmqSection = ({ stateFunctions, zmqPubEnabled }: RpcZmqSectionProps) => {
  const {
    rpcLogin,
    setRpcLogin,
    disableRpcBan,
    setDisableRpcBan,
    rpcSsl,
    setRpcSsl,
    zmqPubEnabled: pubEnabled,
    setZmqPubEnabled,
    zmqPubBindPort,
    setZmqPubBindPort,
    zmqPubTxEnabled,
    setZmqPubTxEnabled,
    zmqPubBlockEnabled,
    setZmqPubBlockEnabled,
  } = stateFunctions;

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
              explanation="Specify username[:password] for RPC server authentication. Format: username:password"
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
              explanation="Do not ban hosts that cause RPC errors. Particularly useful when using Tor to be more forgiving to connecting wallets."
            />
          }
          checked={disableRpcBan}
          onChange={(event) => setDisableRpcBan(event.currentTarget.checked)}
        />
        <Select
          label={
            <ExplainingLabel
              label="RPC SSL Mode"
              explanation="Controls whether SSL encryption is used for RPC connections. 'autodetect' chooses based on the connection port."
            />
          }
          value={rpcSsl}
          onChange={(value) => value && setRpcSsl(value)}
          data={[
            { value: "autodetect", label: "Autodetect (Default)" },
            { value: "enabled", label: "Enabled" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        <Switch
          label={
            <ExplainingLabel
              label="Enable ZMQ Publisher"
              explanation="ZMQ interface enables applications to subscribe to node events like new blocks or transactions."
            />
          }
          checked={pubEnabled}
          onChange={(event) => setZmqPubEnabled(event.currentTarget.checked)}
        />
        {pubEnabled && (
          <NumberInput
            label={
              <ExplainingLabel
                label="ZMQ Publisher Port"
                explanation="Port for the ZMQ publisher. Default is 18084."
              />
            }
            value={parseInt(zmqPubBindPort)}
            onChange={(value) => setZmqPubBindPort(String(value))}
            min={1025}
            max={65535}
          />
        )}
        <Switch
          label={
            <ExplainingLabel
              label="ZMQ Publish Transactions"
              explanation="Enable publishing transaction hashes via ZMQ."
            />
          }
          checked={zmqPubTxEnabled}
          onChange={(event) => setZmqPubTxEnabled(event.currentTarget.checked)}
          disabled={!pubEnabled}
        />
        <Switch
          label={
            <ExplainingLabel
              label="ZMQ Publish Blocks"
              explanation="Enable publishing block hashes via ZMQ."
            />
          }
          checked={zmqPubBlockEnabled}
          onChange={(event) => setZmqPubBlockEnabled(event.currentTarget.checked)}
          disabled={!pubEnabled}
        />
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default RpcZmqSection;
