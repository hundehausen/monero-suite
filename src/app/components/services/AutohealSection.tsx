import { Accordion, Checkbox, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

const AutohealSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isAutoheal, setIsAutoheal } = stateFunctions;

  return (
    <Accordion.Item value="autoheal">
      <Accordion.Control>
        <Text size="lg">Autoheal</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["autoheal"].description}</Text>
        <Checkbox
          checked={isAutoheal}
          label="Autoheal"
          labelPosition="left"
          size="lg"
          onChange={(event) => setIsAutoheal(event.currentTarget.checked)}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default AutohealSection;
