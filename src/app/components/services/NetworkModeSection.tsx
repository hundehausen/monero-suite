import { NetworkMode } from "@/hooks/use-services";
import { SegmentedControl, Text } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import AccordionItemComponent from "./AccordionItemComponent";

const NetworkModeSection = ({
  stateFunctions
}: ServiceComponentProps) => {
  const { networkMode, setNetworkMode } = stateFunctions;

  return (
    <AccordionItemComponent 
      value="exposed"
      title="Where is your Docker host located?"
    >
      <Text size="sm">
        If you specify a docker port mapping like this: &quot;3000:3000&quot;
        it will expose that port on all network interfaces, even if you block
        it with an ufw rule. If you select the option &apos;directly exposed
        to the internet&apos;, some of the services will bind their ports on
        localhost, so they won&apos;t be reachable from the internet, but the
        other services can still communicate with each other.
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
    </AccordionItemComponent>
  );
};

export default NetworkModeSection;
