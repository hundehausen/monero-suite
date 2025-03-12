import { Checkbox, Text } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import AccordionItemComponent from "./AccordionItemComponent";

const AutohealSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isAutoheal, setIsAutoheal } = stateFunctions;

  return (
    <AccordionItemComponent
      value="autoheal"
      title="Autoheal"
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
