import { Architecture } from "@/hooks/use-services";
import { Accordion, SegmentedControl, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

const ArchitectureSection = ({ stateFunctions }: ServiceComponentProps) => {
  const { architecture, setArchitecture } = stateFunctions;

  return (
    <Accordion.Item value="architecture">
      <Accordion.Control>
        <Text size="lg">CPU Architecture</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <SegmentedControl
          value={architecture}
          onChange={(value) => setArchitecture(value as Architecture)}
          styles={{
            control: {
              marginLeft: "auto",
              marginRight: "auto",
            },
            label: {
              fontSize: "16px",
            },
          }}
          data={[
            {
              label: "Linux AMD64",
              value: "linux/amd64",
            },
            {
              label: "Linux ARM64",
              value: "linux/arm64",
            },
          ]}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default ArchitectureSection;
