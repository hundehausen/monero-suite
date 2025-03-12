import { Checkbox, Input, Text } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import AccordionItemComponent from "./AccordionItemComponent";

const MoneroblockSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const {
    isMoneroblock,
    setIsMoneroblock,
    isMoneroblockLogging,
    setIsMoneroblockLogging,
    moneroBlockDomain,
    setMoneroBlockDomain,
    isTraefik,
  } = stateFunctions;

  return (
    <AccordionItemComponent
      value="moneroblock"
      title="Moneroblock - block explorer"
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
      {isMoneroblock && isTraefik && (
        <Input.Wrapper
          styles={{
            root: {
              width: "100%",
            },
          }}
          label="Moneroblock Domain"
          description="The domain where your moneroblock will be available."
        >
          <Input
            value={moneroBlockDomain}
            onChange={(e) => setMoneroBlockDomain(e.currentTarget.value)}
          />
        </Input.Wrapper>
      )}
    </AccordionItemComponent>
  );
};

export default MoneroblockSection;
