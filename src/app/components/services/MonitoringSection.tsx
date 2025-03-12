import { Checkbox, Input, Text } from "@mantine/core";
import { ServiceComponentProps } from "./types";
import AccordionItemComponent from "./AccordionItemComponent";

const MonitoringSection = ({
  services,
  stateFunctions,
}: ServiceComponentProps) => {
  const {
    isMonitoring,
    setIsMonitoring,
    grafanaDomain,
    setGrafanaDomain,
    architecture,
  } = stateFunctions;

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
        <Input.Wrapper
          label="Grafana Hostname"
          description="The domain where your grafana dashboard will be available."
        >
          <Input
            value={grafanaDomain}
            onChange={(e) => setGrafanaDomain(e.currentTarget.value)}
          />
        </Input.Wrapper>
      )}
    </AccordionItemComponent>
  );
};

export default MonitoringSection;
