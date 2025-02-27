import { NetworkMode } from "@/hooks/use-services";
import { Accordion, SegmentedControl, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

interface NetworkModeSectionProps extends ServiceComponentProps {
  value: string;
  onChange: (value: string) => void;
}

const NetworkModeSection = ({
  stateFunctions,
  value,
  onChange,
}: NetworkModeSectionProps) => {
  const { networkMode, setNetworkMode } = stateFunctions;

  return (
    <Accordion.Item value="exposed">
      <Accordion.Control>
        <Text size="lg">Where is your Docker host located?</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">
          If you specify a docker port mapping like this: &quot;3000:3000&quot;
          it will expose that port on all network interfaces, even if you block
          it with an ufw rule. If you select the option 'directly exposed to the
          internet', some of the services will bind their ports on localhost, so
          they won't be reachable from the internet, but the other services can
          still communicate with each other.
        </Text>
        <SegmentedControl
          value={networkMode}
          onChange={(value) => setNetworkMode(value as NetworkMode)}
          styles={{
            control: {
              marginLeft: "auto",
              marginRight: "auto",
            },
            label: {
              fontSize: "12px",
            },
          }}
          data={[
            {
              label: "Local Network (behind NAT)",
              value: "local",
            },
            {
              label: "VPS or directly exposed to the internet",
              value: "exposed",
            },
          ]}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default NetworkModeSection;
