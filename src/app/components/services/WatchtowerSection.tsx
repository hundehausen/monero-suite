import { Checkbox, Text } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import AccordionItemComponent from "./AccordionItemComponent";

const WatchtowerSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isWatchtower, setIsWatchtower } = stateFunctions;

  return (
    <AccordionItemComponent
      value="watchtower"
      title="Watchtower"
    >
      <Text size="sm">{services["watchtower"].description}</Text>
      <Checkbox
        checked={isWatchtower}
        label="Watchtower"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsWatchtower(event.currentTarget.checked)}
      />
    </AccordionItemComponent>
  );
};

export default WatchtowerSection;
