import { Checkbox, Text, TextInput, Stack } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import AccordionItemComponent from "./AccordionItemComponent";

const TraefikSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const { isTraefik, setIsTraefik, mainDomain, setMainDomain } = stateFunctions;

  return (
    <AccordionItemComponent
      value="traefik"
      title="Traefik Reverse Proxy"
    >
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
    </AccordionItemComponent>
  );
};

export default TraefikSection;
