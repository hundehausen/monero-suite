"use client";

import { Alert, Checkbox, Stack, Text, TextInput } from "@mantine/core";
import { useServicesContext, useMonitoringState } from "@/hooks/services-context";
import { DEFAULT_GRAFANA_ADMIN_PASSWORD } from "@/lib/constants";
import { envCredentialError } from "@/lib/schemas";
import AccordionItemComponent from "./AccordionItemComponent";
import ExplainingLabel from "../ExplainingLabel";
import SecretInput from "../SecretInput";

const MonitoringSection = () => {
  const { services } = useServicesContext();
  const {
    isMonitoring,
    setIsMonitoring,
    grafanaAdminUser,
    setGrafanaAdminUser,
    grafanaAdminPassword,
    setGrafanaAdminPassword,
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
        <Stack gap="md" mt="md" pb="xs">
          <TextInput
            label={
              <ExplainingLabel
                label="Grafana admin user"
                explanation="Username written to GF_SECURITY_ADMIN_USER in the generated .env."
              />
            }
            value={grafanaAdminUser}
            onChange={(event) => setGrafanaAdminUser(event.currentTarget.value)}
            error={envCredentialError(grafanaAdminUser) ?? undefined}
          />
          <SecretInput
            label="Grafana admin password"
            explanation="Password written to GF_SECURITY_ADMIN_PASSWORD in the generated .env. Copy it into a password manager."
            value={grafanaAdminPassword}
            onChange={setGrafanaAdminPassword}
            error={envCredentialError(grafanaAdminPassword)}
          />
          {grafanaAdminPassword === DEFAULT_GRAFANA_ADMIN_PASSWORD && (
            <Alert variant="light" color="yellow" title="Shipped default password">
              Grafana still uses admin. Change it here so the generated .env is
              not the default.
            </Alert>
          )}
        </Stack>
      )}
    </AccordionItemComponent>
  );
};

export default MonitoringSection;
