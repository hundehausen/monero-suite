import { ServiceMap, useServices } from "@/hooks/use-services";
import { Accordion } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  ArchitectureSection,
  NetworkModeSection,
  MoneroNodeSection,
  StagenetNodeSection,
  MoneroWalletRpcSection,
  P2PoolSection,
  MoneroblockSection,
  TraefikSection,
  TorProxySection,
  TorHiddenServiceSection,
  MonitoringSection,
  PortainerSection,
  WatchtowerSection,
  AutohealSection,
} from "./services";

interface SelectionProps {
  services: ServiceMap;
  stateFunctions: ReturnType<typeof useServices>["stateFunctions"];
}

const Selection = ({ services, stateFunctions }: SelectionProps) => {
  const {
    isMoneroPublicNode,
    isStagenetNode,
    isStagenetNodePublic,
    p2PoolPayoutAddress,
    isMoneroblock,
    isMonitoring,
    isTraefik,
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
    isTraefik,
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
      <ArchitectureSection
        services={services}
        stateFunctions={stateFunctions}
      />

      <NetworkModeSection
        services={services}
        stateFunctions={stateFunctions}
        value={accordionItems.includes("exposed") ? "exposed" : ""}
        onChange={(value) =>
          setAccordionItems((prev) =>
            prev.includes("exposed")
              ? prev.filter((item) => item !== "exposed")
              : [...prev, "exposed"]
          )
        }
      />

      <MoneroNodeSection services={services} stateFunctions={stateFunctions} />

      <StagenetNodeSection
        services={services}
        stateFunctions={stateFunctions}
      />

      <MoneroWalletRpcSection
        services={services}
        stateFunctions={stateFunctions}
      />

      <TraefikSection services={services} stateFunctions={stateFunctions} />

      <P2PoolSection services={services} stateFunctions={stateFunctions} />

      <MoneroblockSection services={services} stateFunctions={stateFunctions} />

      <TorProxySection services={services} stateFunctions={stateFunctions} />

      <TorHiddenServiceSection
        services={services}
        stateFunctions={stateFunctions}
      />

      <MonitoringSection services={services} stateFunctions={stateFunctions} />

      <PortainerSection services={services} stateFunctions={stateFunctions} />

      <WatchtowerSection services={services} stateFunctions={stateFunctions} />

      <AutohealSection services={services} stateFunctions={stateFunctions} />
    </Accordion>
  );
};

export default Selection;
