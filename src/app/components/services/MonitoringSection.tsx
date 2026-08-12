"use client";

import { Alert, Checkbox, Text } from "@mantine/core";
import { useServicesContext, useMonitoringState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const MonitoringSection = () => {
  const { services } = useServicesContext();
  const {
    isMonitoring,
    setIsMonitoring,
  } = useMonitoringState();

  return (
    <AccordionItemComponent
      value="monitoring"
      title="Monitoring"
      checked={isMonitoring}
    >
      <Text size="sm">{services["monitoring"].description}</Text>
      <Checkbox
        checked={isMonitoring}
        label="Enable Monitoring"
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
