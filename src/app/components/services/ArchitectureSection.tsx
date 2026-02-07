import { Architecture } from "@/hooks/use-services";
import { SegmentedControl } from "@mantine/core";
import { useArchitectureState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const ArchitectureSection = () => {
  const { architecture, setArchitecture } = useArchitectureState();

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
