import { Accordion, Checkbox, Input, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

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
    <Accordion.Item value="moneroblock">
      <Accordion.Control>
        <Text size="lg">Moneroblock - block explorer</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
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
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default MoneroblockSection;
