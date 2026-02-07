import { Alert, Checkbox, Input, Text } from "@mantine/core";
import { useServicesContext, useMonitoringState, useArchitectureState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const MonitoringSection = () => {
  const { services } = useServicesContext();
  const {
    isMonitoring,
    setIsMonitoring,
    grafanaDomain,
    setGrafanaDomain,
  } = useMonitoringState();
  const { architecture } = useArchitectureState();

  if (architecture !== "linux/amd64") {
    return null;
  }

  return (
    <AccordionItemComponent
      value="monitoring"
      title="Monitoring"
    >
      <Text size="sm">{services["monitoring"].description}</Text>
      <Checkbox
        checked={isMonitoring}
        label="Monitoring"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsMonitoring(event.currentTarget.checked)}
      />
      {isMonitoring === true && (
        <>
          <Alert variant="light" color="yellow" title="Security Notice">
            Remember to change the default Grafana admin password in the generated .env file before deploying.
          </Alert>
          <Input.Wrapper
            label="Grafana Hostname"
            description="The domain where your grafana dashboard will be available."
          >
            <Input
              value={grafanaDomain}
              onChange={(e) => setGrafanaDomain(e.currentTarget.value)}
            />
          </Input.Wrapper>
        </>
      )}
    </AccordionItemComponent>
  );
};

export default MonitoringSection;
