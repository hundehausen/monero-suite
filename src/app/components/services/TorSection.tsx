import { TorProxyMode } from "@/hooks/use-services";
import { Checkbox, Code, SegmentedControl, Text, Stack, Divider } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import ExplainingLabel from "../ExplainingLabel";
import AccordionItemComponent from "./AccordionItemComponent";

const TorSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { 
    torProxyMode, 
    setTorProxyMode, 
    isHiddenServices, 
    setIsHiddenServices,
    isGlobalTorProxy,
    setIsGlobalTorProxy,
    networkMode
  } = stateFunctions;

  // Only show global tor proxy option when in local network mode
  const isLocalNetworkMode = networkMode === "local";

  return (
    <AccordionItemComponent
      value="tor"
      title="Tor Proxy & Tor Hidden Services"
    >
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
                    explanation="Use this to send transactions of directly connected wallets via the Tor network. Other traffic will not be routed through Tor."
                  />
                ),
                value: "tx-only",
              },
              {
                label: (
                  <ExplainingLabel
                    label="Full"
                    explanation="Use this option to route all of monerods IPv4 traffic through Tor. It uses SOCKS4."
                  />
                ),
                value: "full",
                disabled: false,
              },
            ]}
          />
          
          {/* Global Tor Proxy Option - only visible when in local network mode and proxy is enabled */}
          {isLocalNetworkMode && torProxyMode !== "none" && (
            <Checkbox
              mt="md"
              checked={isGlobalTorProxy}
              label={
                <ExplainingLabel
                  label="Make Tor proxy available outside Docker network"
                  explanation="This will bind the SOCKS5 port of the Tor service to all network interfaces of the host, making it accessible from other devices on your local network. This option is only available when you're behind NAT. Do not use this option, if your host is part of a public network."
                />
              }
              onChange={(event) => setIsGlobalTorProxy(event.currentTarget.checked)}
            />
          )}
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
    </AccordionItemComponent>
  );
};

export default TorSection;
