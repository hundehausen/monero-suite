"use client";

import { SegmentedControl, SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import type { DnsCheckpointsMode } from "@/hooks/services/monerod/types";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const NetworkSecuritySection = () => {
  const {
    enableDnsBlocklist,
    setEnableDnsBlocklist,
    banList,
    setBanList,
    dnsCheckpoints,
    setDnsCheckpoints,
  } = useMonerodState();

  const banListError = (): string | null => {
    if (!banList) return null;
    if (!banList.startsWith("/"))
      return "Path must be absolute (e.g. /path/to/ban-list.txt)";
    return null;
  };

  return (
    <AccordionItemComponent
      value="network_security"
      title={<Title order={4}>Network Security</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <Switch
          label={
            <ExplainingLabel
              label="Block Malicious Nodes"
              explanation="Automatically ban known bad actors from the network using a community-maintained blocklist. Highly recommended for security."
            />
          }
          checked={enableDnsBlocklist}
          onChange={(event) => setEnableDnsBlocklist(event.currentTarget.checked)}
        />
        <TextInput
          label={
            <ExplainingLabel
              label="Custom Ban List"
              explanation="Path to a text file with IP addresses to ban (one per line). Compose replaces the image command, so this is set explicitly to the community list the Monero image ships at /home/monero/ban_list.txt. Clear the field to disable it, or point it at your own file."
            />
          }
          value={banList}
          onChange={(e) => setBanList(e.currentTarget.value)}
          placeholder="/path/to/custom-ban-list.txt"
          error={banListError()}
        />
        <div>
          <ExplainingLabel
            label="DNS Checkpoints"
            explanation="Control how MoneroPulse DNS checkpoints are used for extra verification against deep reorgs. Skip disables them (reduces protection), Enforce rolls the chain back when the local copy doesn't match the checkpoint hash."
          />
          <SegmentedControl
            value={dnsCheckpoints}
            onChange={(value) => setDnsCheckpoints(value as DnsCheckpointsMode)}
            fullWidth
            styles={{
              label: {
                fontSize: "16px",
              },
            }}
            data={[
              {
                label: "Default",
                value: "default",
              },
              {
                label: "Skip",
                value: "skip",
              },
              {
                label: "Enforce",
                value: "enforce",
              },
            ]}
          />
        </div>
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default NetworkSecuritySection;
