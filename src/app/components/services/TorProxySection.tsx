import { TorProxyMode } from "@/hooks/use-services";
import { Accordion, SegmentedControl, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";
import ExplainingLabel from "../ExplainingLabel";

const TorProxySection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { torProxyMode, setTorProxyMode, architecture } = stateFunctions;

  if (architecture !== "linux/amd64") {
    return null;
  }

  return (
    <Accordion.Item value="tor-proxy">
      <Accordion.Control>
        <Text size="lg">Tor Proxy</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["tor-proxy"].description}</Text>
        <SegmentedControl
          value={torProxyMode}
          onChange={(value) => setTorProxyMode(value as TorProxyMode)}
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
                  explanation="Use this to route all traffic of monerod through Tor. This is not availiable yet, because the tor-proxy docker image does only support SOCKS5 and monerod only supports SOCKS4."
                />
              ),
              value: "full",
              disabled: true,
            },
          ]}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default TorProxySection;
