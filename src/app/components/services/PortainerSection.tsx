import { Checkbox, Input, Text } from "@mantine/core";
import { useServicesContext, usePortainerState, useTraefikState, useMonerodState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const PortainerSection = () => {
  const { services } = useServicesContext();
  const {
    isPortainer,
    setIsPortainer,
    portainerDomain,
    setPortainerDomain,
  } = usePortainerState();
  const { isTraefik } = useTraefikState();
  const { moneroNodeDomain } = useMonerodState();

  return (
    <AccordionItemComponent
      value="portainer"
      title="Portainer"
    >
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
    </AccordionItemComponent>
  );
};

export default PortainerSection;
