import { ServiceComponentProps } from "./types";
import {
  Anchor,
  Text,
  Badge,
  Checkbox,
} from "@mantine/core";
import AccordionItemComponent from "./AccordionItemComponent";

const CuprateSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const {
    isCuprateEnabled,
    setIsCuprateEnabled,
  } = stateFunctions;

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
        Learn more about Cuprate
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

    </AccordionItemComponent>
  );
};

export default CuprateSection;
