import { Checkbox, Text } from "@mantine/core";
import { useServicesContext, useAutohealState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const AutohealSection = () => {
  const { services } = useServicesContext();
  const { isAutoheal, setIsAutoheal } = useAutohealState();

  return (
    <AccordionItemComponent
      value="autoheal"
      title="Autoheal"
      checked={isAutoheal}
    >
      <Text size="sm">{services["autoheal"].description}</Text>
      <Checkbox
        checked={isAutoheal}
        label="Autoheal"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsAutoheal(event.currentTarget.checked)}
      />
    </AccordionItemComponent>
  );
};

export default AutohealSection;
