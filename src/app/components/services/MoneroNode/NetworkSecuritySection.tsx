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
              label="Enable DNS Blocklist"
              explanation="Use DNS-based blocklist to automatically ban known malicious nodes. Recommended for security."
            />
          }
          checked={enableDnsBlocklist}
          onChange={(event) => setEnableDnsBlocklist(event.currentTarget.checked)}
        />
        <TextInput
          label={
            <ExplainingLabel
              label="Ban List File"
              explanation="Path to a file containing a list of IP addresses to ban. Each IP should be on a separate line. The monerod image that is used in Monero Suite has the ban list set to 'Boog900/monero-ban-list' automatically. You don't need to specify this one."
            />
          }
          value={banList}
          onChange={(e) => setBanList(e.currentTarget.value)}
          placeholder="/path/to/ban-list.txt"
        />
        <Switch
          label={
            <ExplainingLabel
              label="Disable DNS Checkpoints"
              explanation="Disable MoneroPulse DNS checkpoints. Not recommended unless you have a specific reason to do so."
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
