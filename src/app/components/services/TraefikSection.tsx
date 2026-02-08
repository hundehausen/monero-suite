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
  const { isTraefik, setIsTraefik } = useTraefikState();
  const { isMoneroPublicNode, moneroNodeDomain, setMoneroNodeDomain } = useMonerodState();
  const { isStagenetNode, isStagenetNodePublic, stagenetNodeDomain, setStagenetNodeDomain } = useStagenetState();
  const { isMoneroblock, moneroBlockDomain, setMoneroBlockDomain } = useMoneroblockState();
  const { isOnionMoneroBlockchainExplorer, onionMoneroBlockchainExplorerDomain, setOnionMoneroBlockchainExplorerDomain } = useOnionExplorerState();
  const { isMonitoring, grafanaDomain, setGrafanaDomain } = useMonitoringState();
  const { isPortainer, portainerDomain, setPortainerDomain } = usePortainerState();

  const domainInputs = [
    { show: isMoneroPublicNode, label: "Monero Node Domain", description: "The domain where your Monero node will be available. Connect from any wallet using this domain on port 443. This maps to the restricted RPC port 18089.", value: moneroNodeDomain, onChange: setMoneroNodeDomain },
    { show: isStagenetNode && isStagenetNodePublic, label: "Stagenet Node Domain", description: "The domain where your stagenet node will be available.", value: stagenetNodeDomain, onChange: setStagenetNodeDomain },
    { show: isMoneroblock, label: "Moneroblock Domain", description: "The domain where your Moneroblock explorer will be available.", value: moneroBlockDomain, onChange: setMoneroBlockDomain },
    { show: isOnionMoneroBlockchainExplorer, label: "Onion Explorer Domain", description: "The domain where your Onion Monero Blockchain Explorer will be available.", value: onionMoneroBlockchainExplorerDomain, onChange: setOnionMoneroBlockchainExplorerDomain },
    { show: isMonitoring, label: "Grafana Domain", description: "The domain where your Grafana dashboard will be available.", value: grafanaDomain, onChange: setGrafanaDomain },
    { show: isPortainer, label: "Portainer Domain", description: "The domain where your Portainer instance will be available.", value: portainerDomain, onChange: setPortainerDomain },
  ];

  const visibleDomainInputs = domainInputs.filter((d) => d.show);

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
            {visibleDomainInputs.length > 0 ? (
              visibleDomainInputs.map((input) => (
                <TextInput
                  key={input.label}
                  label={input.label}
                  description={input.description}
                  value={input.value}
                  onChange={(e) => input.onChange(e.currentTarget.value)}
                />
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
