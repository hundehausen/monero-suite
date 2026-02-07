import { Alert, Checkbox, Text, TextInput, Stack } from "@mantine/core";
import { useServicesContext, useTraefikState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const TraefikSection = () => {
  const { services } = useServicesContext();
  const { isTraefik, setIsTraefik, mainDomain, setMainDomain } = useTraefikState();

  return (
    <AccordionItemComponent
      value="traefik"
      title="Traefik Reverse Proxy"
      checked={isTraefik}
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
          <>
            <Alert variant="light" color="blue" title="DNS Setup Required">
              Make sure your domain&apos;s DNS A/AAAA records point to your server&apos;s IP address. Traefik will automatically obtain Let&apos;s Encrypt TLS certificates once DNS is configured.
            </Alert>
            <TextInput
              label="Main Domain"
              description="Enter your main domain. This will be used for all services (please change this to your own domain)"
              placeholder="example.com"
              value={mainDomain}
              onChange={(e) => setMainDomain(e.currentTarget.value)}
            />
          </>
        )}
      </Stack>
    </AccordionItemComponent>
  );
};

export default TraefikSection;
