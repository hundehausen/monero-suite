import { Alert, Checkbox, Text, Badge } from "@mantine/core";
import { useServicesContext, useMonitoringState, useArchitectureState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const MonitoringSection = () => {
  const { services } = useServicesContext();
  const {
    isMonitoring,
    setIsMonitoring,
  } = useMonitoringState();
  const { architecture } = useArchitectureState();

  if (architecture !== "linux/amd64") {
    return (
      <AccordionItemComponent value="monitoring" title="Monitoring" checked={false}>
        <Text size="sm" c="dimmed" component="div">
          Monitoring (Grafana + Prometheus + node-exporter) is only available on <Badge variant="light" color="gray" size="sm">linux/amd64</Badge>. Switch the architecture above to enable it.
        </Text>
      </AccordionItemComponent>
    );
  }

  return (
    <AccordionItemComponent
      value="monitoring"
      title="Monitoring"
      checked={isMonitoring}
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
        <Alert variant="light" color="yellow" title="Security Notice">
          Remember to change the default Grafana admin password in the generated .env file before deploying.
        </Alert>
      )}
    </AccordionItemComponent>
  );
};

export default MonitoringSection;
