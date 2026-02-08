import { SimpleGrid, Switch, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const NetworkSecuritySection = () => {
  const {
    enableDnsBlocklist,
    setEnableDnsBlocklist,
    banList,
    setBanList,
    disableDnsCheckpoints,
    setDisableDnsCheckpoints,
  } = useMonerodState();

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
              explanation="Path to a text file with IP addresses to ban (one per line). The default Monero image already includes a community ban list, so you typically don't need to set this."
            />
          }
          value={banList}
          onChange={(e) => setBanList(e.currentTarget.value)}
          placeholder="/path/to/custom-ban-list.txt"
        />
        <Switch
          label={
            <ExplainingLabel
              label="Skip DNS Checkpoints"
              explanation="Don't use MoneroPulse DNS checkpoints for extra verification. Only disable if you know what you're doing - this reduces protection against deep reorgs."
            />
          }
          checked={disableDnsCheckpoints}
          onChange={(event) => setDisableDnsCheckpoints(event.currentTarget.checked)}
        />
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default NetworkSecuritySection;
