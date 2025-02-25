import { Accordion, Checkbox, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

const WatchtowerSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isWatchtower, setIsWatchtower } = stateFunctions;

  return (
    <Accordion.Item value="watchtower">
      <Accordion.Control>
        <Text size="lg">Watchtower</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["watchtower"].description}</Text>
        <Checkbox
          checked={isWatchtower}
          label="Watchtower"
          labelPosition="left"
          size="lg"
          onChange={(event) => setIsWatchtower(event.currentTarget.checked)}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default WatchtowerSection;
