import { NumberInput, Select, SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const RpcZmqSection = () => {
  const {
    rpcLogin,
    setRpcLogin,
    disableRpcBan,
    setDisableRpcBan,
    rpcSsl,
    setRpcSsl,
    zmqPubEnabled,
    setZmqPubEnabled,
    zmqPubBindPort,
    setZmqPubBindPort,
  } = useMonerodState();

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
        <Select
          label={
            <ExplainingLabel
              label="RPC SSL Mode"
              explanation="TLS encryption for RPC connections. Autodetect (default) enables TLS on HTTPS ports. Disable if using a reverse proxy for TLS termination."
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
          checked={zmqPubEnabled}
          onChange={(event) => setZmqPubEnabled(event.currentTarget.checked)}
        />
        {zmqPubEnabled && (
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
