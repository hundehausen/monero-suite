import { Accordion, Checkbox, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

const TraefikSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isTraefik, setIsTraefik } = stateFunctions;

  return (
    <Accordion.Item value="traefik">
      <Accordion.Control>
        <Text size="lg">Traefik Reverse Proxy</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["traefik"].description}</Text>
        <Checkbox
          checked={isTraefik}
          label="Traefik"
          labelPosition="left"
          size="lg"
          onChange={(event) => setIsTraefik(event.currentTarget.checked)}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default TraefikSection;
