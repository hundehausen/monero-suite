import { Checkbox, Text } from "@mantine/core";
import { useServicesContext, useMoneroblockState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const MoneroblockSection = () => {
  const { services } = useServicesContext();
  const {
    isMoneroblock,
    setIsMoneroblock,
    isMoneroblockLogging,
    setIsMoneroblockLogging,
  } = useMoneroblockState();

  return (
    <AccordionItemComponent
      value="moneroblock"
      title="Moneroblock - block explorer"
      checked={isMoneroblock}
    >
      <Text size="sm">{services["moneroblock"].description}</Text>
      <Checkbox
        checked={isMoneroblock}
        label="Moneroblock"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsMoneroblock(event.currentTarget.checked)}
      />
      {isMoneroblock && (
        <Checkbox
          checked={!isMoneroblockLogging}
          label="Disable Moneroblock logging"
          labelPosition="left"
          size="md"
          onChange={(event) =>
            setIsMoneroblockLogging(!event.currentTarget.checked)
          }
          styles={{
            label: {
              fontSize: "12px",
            },
          }}
        />
      )}
    </AccordionItemComponent>
  );
};

export default MoneroblockSection;
