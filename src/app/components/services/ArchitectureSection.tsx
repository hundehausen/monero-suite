import { Architecture } from "@/hooks/use-services";
import { SegmentedControl } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import AccordionItemComponent from "./AccordionItemComponent";

const ArchitectureSection = ({ stateFunctions }: ServiceComponentProps) => {
  const { architecture, setArchitecture } = stateFunctions;

  return (
    <AccordionItemComponent
      value="architecture"
      title="CPU Architecture"
    >
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
    </AccordionItemComponent>
  );
};

export default ArchitectureSection;
