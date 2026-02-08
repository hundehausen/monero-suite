import { Checkbox, Text } from "@mantine/core";
import { useServicesContext, usePortainerState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const PortainerSection = () => {
  const { services } = useServicesContext();
  const {
    isPortainer,
    setIsPortainer,
  } = usePortainerState();

  return (
    <AccordionItemComponent
      value="portainer"
      title="Portainer"
      checked={isPortainer}
    >
      <Text size="sm">{services["portainer"].description}</Text>
      <Checkbox
        checked={isPortainer}
        label="Portainer"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsPortainer(event.currentTarget.checked)}
      />
    </AccordionItemComponent>
  );
};

export default PortainerSection;
