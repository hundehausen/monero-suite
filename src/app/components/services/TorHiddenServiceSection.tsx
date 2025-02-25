import { Accordion, Checkbox, Code, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

const TorHiddenServiceSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isHiddenServices, setIsHiddenServices, architecture } =
    stateFunctions;

  if (architecture !== "linux/amd64") {
    return null;
  }

  return (
    <Accordion.Item value="tor-hidden-service">
      <Accordion.Control>
        <Text size="lg">Tor hidden service</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["tor-hidden-service"].description}</Text>
        <Checkbox
          checked={isHiddenServices}
          label="Tor Hidden Services"
          labelPosition="left"
          size="lg"
          onChange={(event) => setIsHiddenServices(event.currentTarget.checked)}
        />
        <Text size="sm">
          Use <Code>docker logs tor-hidden-service</Code> to get generated onion
          addresses, after the container has started.
        </Text>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default TorHiddenServiceSection;
