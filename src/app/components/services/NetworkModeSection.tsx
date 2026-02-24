import { NetworkMode } from "@/hooks/use-services";
import { SegmentedControl, Text } from "@mantine/core";
import { useNetworkModeState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const NetworkModeSection = () => {
  const { networkMode, setNetworkMode } = useNetworkModeState();

  return (
    <AccordionItemComponent
      value="exposed"
      title="Where is your Docker host located?"
    >
      <Text size="sm">
        Select where your server is running. If it&apos;s a home machine behind
        a router, choose Local Network. If it&apos;s a VPS or cloud server
        connected directly to the internet, choose VPS — this restricts
        certain ports to localhost so they aren&apos;t accidentally exposed
        publicly.
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
