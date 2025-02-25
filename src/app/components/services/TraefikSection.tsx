import { Accordion, Checkbox, Text, TextInput, Stack } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

const TraefikSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isTraefik, setIsTraefik, mainDomain, setMainDomain } = stateFunctions;

  return (
    <Accordion.Item value="traefik">
      <Accordion.Control>
        <Text size="lg">Traefik Reverse Proxy</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["traefik"].description}</Text>
        <Stack gap="md">
          <Checkbox
            checked={isTraefik}
            label="Traefik"
            labelPosition="left"
            size="lg"
            onChange={(event) => setIsTraefik(event.currentTarget.checked)}
          />

          {isTraefik && (
            <TextInput
              label="Main Domain"
              description="Enter your main domain. This will be used for all services (please change this to your own domain)"
              placeholder="monerosuite.org"
              value={mainDomain}
              onChange={(e) => setMainDomain(e.currentTarget.value)}
            />
          )}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default TraefikSection;
