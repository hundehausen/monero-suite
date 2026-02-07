import {
  Anchor,
  Text,
  Badge,
  Checkbox,
} from "@mantine/core";
import { useServicesContext, useCuprateState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const CuprateSection = () => {
  const { services } = useServicesContext();
  const {
    isCuprateEnabled,
    setIsCuprateEnabled,
  } = useCuprateState();

  return (
    <AccordionItemComponent
      value="cuprate-node"
      title={
        <>
          Cuprate Node
          <Badge color="red" size="sm" ml={8}>Experimental</Badge>
        </>
      }
    >
      <Text size="sm">{services["cuprate"].description}</Text>
      <Anchor href="https://github.com/Cuprate/cuprate" target="_blank">
        Learn more about Cuprate.
      </Anchor>

      <Checkbox
        checked={isCuprateEnabled}
        label="Enable Cuprate Node"
        labelPosition="left"
        onChange={(event) =>
          setIsCuprateEnabled(event.currentTarget.checked)
        }
        size="lg"
      />

      <Text size="sm">The port mapping on the host is on port 18082, the internal port is 18080. This is to avoid an overlapping port conflict with monerod.</Text>

    </AccordionItemComponent>
  );
};

export default CuprateSection;
