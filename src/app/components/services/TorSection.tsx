import { TorProxyMode } from "@/hooks/use-services";
import { Accordion, Checkbox, Code, SegmentedControl, Text, Stack, Divider } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";
import ExplainingLabel from "../ExplainingLabel";

const TorSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { 
    torProxyMode, 
    setTorProxyMode, 
    isHiddenServices, 
    setIsHiddenServices
  } = stateFunctions;


  return (
    <Accordion.Item value="tor">
      <Accordion.Control>
        <Text size="lg">Tor Service</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["tor"].description}</Text>
        
        <Stack>
          {/* Tor Proxy Section */}
          <div>
            <Text size="md" mb="xs">Tor Proxy</Text>
            <SegmentedControl
              value={torProxyMode}
              fullWidth
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
                  disabled: false,
                },
              ]}
            />
          </div>

          <Divider />

          {/* Tor Hidden Service Section */}
          <div>
            <Text size="md"  mb="xs">Tor Hidden Service</Text>
            <Checkbox
              checked={isHiddenServices}
              label="Enable Tor Hidden Services"
              labelPosition="left"
              size="lg"
              onChange={(event) => setIsHiddenServices(event.currentTarget.checked)}
            />
            <Text size="sm" mt="xs">
              Use <Code>docker logs tor</Code> to get generated onion
              addresses, after the container has started.
            </Text>
          </div>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default TorSection;
