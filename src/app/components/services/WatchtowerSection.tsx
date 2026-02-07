import { Checkbox, Text } from "@mantine/core";
import { useServicesContext, useWatchtowerState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const WatchtowerSection = () => {
  const { services } = useServicesContext();
  const { isWatchtower, setIsWatchtower } = useWatchtowerState();

  return (
    <AccordionItemComponent
      value="watchtower"
      title="Watchtower"
      checked={isWatchtower}
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
