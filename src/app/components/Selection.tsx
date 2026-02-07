import { Accordion } from "@mantine/core";
import { useEffect, useState } from "react";
import { useServicesContext } from "@/hooks/services-context";
import {
  ArchitectureSection,
  NetworkModeSection,
  MoneroNodeSection,
  StagenetNodeSection,
  MoneroWalletRpcSection,
  P2PoolSection,
  MoneroblockSection,
  TraefikSection,
  TorSection,
  MonitoringSection,
  PortainerSection,
  WatchtowerSection,
  AutohealSection,
  CuprateSection,
} from "./services";

const Selection = () => {
  const { stateFunctions } = useServicesContext();
  const {
    isMoneroPublicNode,
    isStagenetNode,
    isStagenetNodePublic,
    p2PoolPayoutAddress,
    isMoneroblock,
    isMonitoring,
    isTraefik
  } = stateFunctions;

  const [accordionItems, setAccordionItems] = useState([
    "architecture",
    "exposed",
    "mainnet-node",
  ]);

  const p2poolPayoutAddressError = () => {
    if (p2PoolPayoutAddress.length === 0) return null;
    if (p2PoolPayoutAddress.length < 95) return "Address too short";
    if (p2PoolPayoutAddress.length > 95) return "Address too long";
    if (!p2PoolPayoutAddress.startsWith("4"))
      return "Address must start with 4. Subaddresses are not supported by P2Pool.";
    return null;
  };

  useEffect(() => {
    if (isTraefik) {
      setAccordionItems((items) => [
        ...items,
        ...(isMoneroPublicNode ? ["monero-node"] : []),
        ...(isStagenetNode && isStagenetNodePublic ? ["stagenet-node"] : []),
        ...(isMoneroblock ? ["moneroblock"] : []),
        ...(isMonitoring ? ["monitoring"] : []),
      ]);
    }
  }, [
    isMoneroPublicNode,
    isMoneroblock,
    isMonitoring,
    isStagenetNode,
    isStagenetNodePublic,
    isTraefik
  ]);

  return (
    <Accordion
      multiple
      value={accordionItems}
      variant="separated"
      onChange={setAccordionItems}
      defaultValue={["mainnet-node"]}
      styles={{
        panel: {
          paddingTop: "8px",
        },
      }}
    >
      <ArchitectureSection />
      <NetworkModeSection />
      <MoneroNodeSection />
      <StagenetNodeSection />
      <MoneroWalletRpcSection />
      <TraefikSection />
      <P2PoolSection />
      <MoneroblockSection />
      <TorSection />
      <MonitoringSection />
      <PortainerSection />
      <WatchtowerSection />
      <AutohealSection />
      <CuprateSection />
    </Accordion>
  );
};

export default Selection;
