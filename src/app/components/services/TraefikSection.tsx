import { Alert, Checkbox, Text, TextInput, Stack } from "@mantine/core";
import {
  useServicesContext,
  useTraefikState,
  useMonerodState,
  useStagenetState,
  useMoneroblockState,
  useOnionExplorerState,
  useMonitoringState,
  usePortainerState,
} from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const TraefikSection = () => {
  const { services } = useServicesContext();
  const {
    isTraefik, setIsTraefik,
    isTraefikMonerod, setIsTraefikMonerod,
    isTraefikStagenet, setIsTraefikStagenet,
    isTraefikMoneroblock, setIsTraefikMoneroblock,
    isTraefikOnionExplorer, setIsTraefikOnionExplorer,
    isTraefikGrafana, setIsTraefikGrafana,
    isTraefikPortainer, setIsTraefikPortainer,
  } = useTraefikState();
  const { isMoneroPublicNode, moneroNodeDomain, setMoneroNodeDomain } = useMonerodState();
  const { isStagenetNode, isStagenetNodePublic, stagenetNodeDomain, setStagenetNodeDomain } = useStagenetState();
  const { isMoneroblock, moneroBlockDomain, setMoneroBlockDomain } = useMoneroblockState();
  const { isOnionMoneroBlockchainExplorer, onionMoneroBlockchainExplorerDomain, setOnionMoneroBlockchainExplorerDomain } = useOnionExplorerState();
  const { isMonitoring, grafanaDomain, setGrafanaDomain } = useMonitoringState();
  const { isPortainer, portainerDomain, setPortainerDomain } = usePortainerState();

  const domainInputs = [
    {
      show: isMoneroPublicNode,
      checkboxLabel: "Monero Node",
      inputLabel: "Monero Node Domain",
      description: "The domain where your Monero node will be available. Connect from any wallet using this domain on port 443. This maps to the restricted RPC port 18089.",
      value: moneroNodeDomain,
      onChange: setMoneroNodeDomain,
      isEnabled: isTraefikMonerod,
      setIsEnabled: setIsTraefikMonerod,
    },
    {
      show: isStagenetNode && isStagenetNodePublic,
      checkboxLabel: "Stagenet Node",
      inputLabel: "Stagenet Node Domain",
      description: "The domain where your stagenet node will be available.",
      value: stagenetNodeDomain,
      onChange: setStagenetNodeDomain,
      isEnabled: isTraefikStagenet,
      setIsEnabled: setIsTraefikStagenet,
    },
    {
      show: isMoneroblock,
      checkboxLabel: "Moneroblock Explorer",
      inputLabel: "Moneroblock Domain",
      description: "The domain where your Moneroblock explorer will be available.",
      value: moneroBlockDomain,
      onChange: setMoneroBlockDomain,
      isEnabled: isTraefikMoneroblock,
      setIsEnabled: setIsTraefikMoneroblock,
    },
    {
      show: isOnionMoneroBlockchainExplorer,
      checkboxLabel: "Onion Monero Explorer",
      inputLabel: "Onion Explorer Domain",
      description: "The domain where your Onion Monero Blockchain Explorer will be available.",
      value: onionMoneroBlockchainExplorerDomain,
      onChange: setOnionMoneroBlockchainExplorerDomain,
      isEnabled: isTraefikOnionExplorer,
      setIsEnabled: setIsTraefikOnionExplorer,
    },
    {
      show: isMonitoring,
      checkboxLabel: "Grafana",
      inputLabel: "Grafana Domain",
      description: "The domain where your Grafana dashboard will be available.",
      value: grafanaDomain,
      onChange: setGrafanaDomain,
      isEnabled: isTraefikGrafana,
      setIsEnabled: setIsTraefikGrafana,
    },
    {
      show: isPortainer,
      checkboxLabel: "Portainer",
      inputLabel: "Portainer Domain",
      description: "The domain where your Portainer instance will be available.",
      value: portainerDomain,
      onChange: setPortainerDomain,
      isEnabled: isTraefikPortainer,
      setIsEnabled: setIsTraefikPortainer,
    },
  ];

  const visibleDomainInputs = domainInputs.filter((d) => d.show);
  const hasDefaultDomain = visibleDomainInputs.some((d) => d.isEnabled && d.value.includes("example.com"));

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
            {hasDefaultDomain && (
              <Alert variant="light" color="red" title="Domain not configured">
                Replace all <strong>example.com</strong> domains below before generating the install command.
              </Alert>
            )}
            {visibleDomainInputs.length > 0 ? (
              visibleDomainInputs.map((input) => (
                <Stack key={input.checkboxLabel} gap="xs">
                  <Checkbox
                    checked={input.isEnabled}
                    label={input.checkboxLabel}
                    onChange={(event) => input.setIsEnabled(event.currentTarget.checked)}
                  />
                  {input.isEnabled && (
                    <TextInput
                      pl="xl"
                      label={input.inputLabel}
                      description={input.description}
                      value={input.value}
                      onChange={(e) => input.onChange(e.currentTarget.value)}
                      error={input.value.includes("example.com") ? "Replace with your actual domain" : undefined}
                    />
                  )}
                </Stack>
              ))
            ) : (
              <Text size="sm" c="dimmed">
                Enable services with web interfaces to configure their domains here.
              </Text>
            )}
          </>
        )}
      </Stack>
    </AccordionItemComponent>
  );
};

export default TraefikSection;
