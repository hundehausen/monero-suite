import { Accordion, Checkbox, Input, Text } from "@mantine/core";
import { ServiceComponentProps, panelStyles } from "./types";

const PortainerSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const {
    isPortainer,
    setIsPortainer,
    portainerDomain,
    setPortainerDomain,
    isTraefik,
    moneroNodeDomain,
  } = stateFunctions;

  return (
    <Accordion.Item value="portainer">
      <Accordion.Control>
        <Text size="lg">Portainer</Text>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        <Text size="sm">{services["portainer"].description}</Text>
        <Checkbox
          checked={isPortainer}
          label="Portainer"
          labelPosition="left"
          size="lg"
          onChange={(event) => setIsPortainer(event.currentTarget.checked)}
        />
        {isPortainer && isTraefik && (
          <>
            <Input.Wrapper
              styles={{
                root: {
                  width: "100%",
                },
              }}
              label="Portainer Domain"
              description="The domain where your portainer instance will be available."
            >
              <Input
                value={portainerDomain}
                onChange={(e) => setPortainerDomain(e.currentTarget.value)}
              />
            </Input.Wrapper>
            {portainerDomain && (
              <Text size="sm">{`Connect to your remote node from any wallet. Enter https://${moneroNodeDomain}`}</Text>
            )}
          </>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default PortainerSection;
