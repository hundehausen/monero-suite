"use client";

import { TorProxyMode } from "@/hooks/use-services";
import { Alert, Checkbox, Code, SegmentedControl, Text, Stack, Divider } from "@mantine/core";
import { useServicesContext, useTorState, useNetworkModeState, useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../ExplainingLabel";
import AccordionItemComponent from "./AccordionItemComponent";

const TorSection = () => {
  const { services } = useServicesContext();
  const {
    torProxyMode,
    setTorProxyMode,
    isHiddenServices,
    hsMonerod,
    setHsMonerod,
    hsMonerodP2P,
    setHsMonerodP2P,
    hsStagenet,
    setHsStagenet,
    hsP2Pool,
    setHsP2Pool,
    hsGrafana,
    setHsGrafana,
    isGlobalTorProxy,
    setIsGlobalTorProxy,
  } = useTorState();
  const { networkMode } = useNetworkModeState();
  const { anonymousInbound } = useMonerodState();

  // Only show global tor proxy option when in local network mode
  const isLocalNetworkMode = networkMode === "local";

  return (
    <AccordionItemComponent
      value="tor"
      title="Tor Proxy & Tor Hidden Services"
      checked={torProxyMode !== "none" || isHiddenServices}
    >
      <Text size="sm">{services["tor"].description}</Text>

      <Stack>
        {/* Tor Proxy Section */}
        <div>
          <Text size="md" mb="xs">Tor Proxy</Text>
          <SegmentedControl
            value={torProxyMode}
            fullWidth
            onChange={(value) => setTorProxyMode(value as TorProxyMode)}
            styles={{
              label: {
                fontSize: "16px",
              },
            }}
            data={[
              {
                label: "None",
                value: "none",
              },
              {
                label: (
                  <ExplainingLabel
                    label="Tx only"
                    explanation="Route transaction broadcasts from connected wallets through Tor. All other node traffic remains on the clearnet."
                  />
                ),
                value: "tx-only",
              },
              {
                label: (
                  <ExplainingLabel
                    label="Full"
                    explanation="Route all of monerod's p2p IPv4 traffic through Tor. Uses a SOCKS4 proxy."
                  />
                ),
                value: "full",
                disabled: false,
              },
            ]}
          />

          {torProxyMode !== "none" && (
            <Alert variant="light" color="blue" title="Docker Network">
              Enabling the Tor proxy creates a dedicated Docker network with static IPs so services can communicate through the Tor SOCKS proxy. Fixed IPs are used because DNS resolution is not available with the proxy flag in monerod.
            </Alert>
          )}

          {/* Global Tor Proxy Option - only visible when in local network mode and proxy is enabled */}
          {isLocalNetworkMode && torProxyMode !== "none" && (
            <Checkbox
              mt="md"
              checked={isGlobalTorProxy}
              label={
                <ExplainingLabel
                  label="Make Tor proxy available outside Docker network"
                  explanation="This will bind the SOCKS5 port of the Tor service to all network interfaces of the host, making it accessible from other devices on your local network. This option is only available when you're behind NAT. Do not use this option if your host is part of a public network."
                />
              }
              onChange={(event) => setIsGlobalTorProxy(event.currentTarget.checked)}
            />
          )}
        </div>

        <Divider />

        {/* Tor Hidden Services Section */}
        <div>
          <Text size="md" mb="xs">Tor Hidden Services</Text>
          <Text size="sm" mb="sm">
            Select which services to expose as Tor hidden services. Each selected service gets its own .onion address.
          </Text>
          <Stack gap="xs">
            {services["monerod"]?.checked && (
              <Checkbox
                checked={hsMonerod}
                label="Monerod (Restricted RPC)"
                onChange={(event) => setHsMonerod(event.currentTarget.checked)}
              />
            )}
            {services["monerod"]?.checked && (
              <>
                <Checkbox
                  checked={hsMonerodP2P}
                  label={
                    <ExplainingLabel
                      label="Monerod (P2P Anonymous Inbound)"
                      explanation={
                        "Creates a hidden service for monerod P2P traffic on port 18084, allowing other Tor nodes to peer with your node anonymously. "
                        + "After first deployment, run `docker logs tor` to find the generated .onion address. "
                        + "Then set the monerod flag --anonymous-inbound=<your_onion_address>.onion:18084,127.0.0.1:18084 "
                        + "in the Anonymous Inbound field under Monerod Advanced Settings > Tor/I2P, and redeploy with `docker compose up -d`."
                      }
                    />
                  }
                  onChange={(event) => setHsMonerodP2P(event.currentTarget.checked)}
                />
                {hsMonerodP2P && anonymousInbound.trim().length === 0 && (
                  <Alert variant="light" color="yellow" title="P2P Hidden Service Accepts No Connections Yet">
                    monerod will not listen on port 18084 until an Anonymous Inbound value is set. After your first deployment,
                    run <Code>docker logs tor</Code> to find the generated .onion address, then paste it into{" "}
                    <strong>Monerod Advanced Settings &gt; Tor/I2P &gt; Anonymous Inbound</strong> in the format{" "}
                    <Code>&lt;onion&gt;:18084,127.0.0.1:18084</Code>, and redeploy with <Code>docker compose up -d</Code>.
                  </Alert>
                )}
                {!hsMonerodP2P && anonymousInbound.trim().length > 0 && (
                  <Alert variant="light" color="blue" title="Anonymous Inbound Has No Hidden Service">
                    This Anonymous Inbound value has no effect: the Monerod (P2P Anonymous Inbound) hidden service is
                    disabled, so nothing listens on or forwards to port 18084. Enable the hidden service above and complete
                    its setup steps to accept inbound P2P connections.
                  </Alert>
                )}
              </>
            )}
            {services["monerod-stagenet"]?.checked && (
              <Checkbox
                checked={hsStagenet}
                label="Monerod Stagenet (Restricted RPC)"
                onChange={(event) => setHsStagenet(event.currentTarget.checked)}
              />
            )}
            {services["p2pool"]?.checked && (
              <Checkbox
                checked={hsP2Pool}
                label="P2Pool (Stratum)"
                onChange={(event) => setHsP2Pool(event.currentTarget.checked)}
              />
            )}
            {services["monitoring"]?.checked && (
              <Checkbox
                checked={hsGrafana}
                label="Grafana (Monitoring Dashboard)"
                onChange={(event) => setHsGrafana(event.currentTarget.checked)}
              />
            )}
          </Stack>
          {isHiddenServices && (
            <Text size="sm" mt="xs">
              Use <Code>docker logs tor</Code> to get generated onion
              addresses, after the container has started.
            </Text>
          )}
        </div>
      </Stack>
    </AccordionItemComponent>
  );
};

export default TorSection;
