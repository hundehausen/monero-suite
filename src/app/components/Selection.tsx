"use client";

import { Accordion } from "@mantine/core";
import { useState } from "react";
import {
  ArchitectureSection,
  NetworkModeSection,
  MoneroNodeSection,
  StagenetNodeSection,
  MoneroWalletRpcSection,
  MoneroLwsSection,
  MoneroPaySection,
  P2PoolSection,
  XmrigProxySection,
  TraefikSection,
  TorSection,
  MonitoringSection,
  PortainerSection,
  WatchtowerSection,
  CuprateSection,
} from "./services";

const Selection = () => {
  const [accordionItems, setAccordionItems] = useState([
    "architecture",
    "exposed",
    "mainnet-node",
  ]);

  return (
    <Accordion
      multiple
      value={accordionItems}
      variant="separated"
      onChange={setAccordionItems}
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
      <MoneroLwsSection />
      <MoneroPaySection />
      <TraefikSection />
      <P2PoolSection />
      <XmrigProxySection />
      <TorSection />
      <MonitoringSection />
      <PortainerSection />
      <WatchtowerSection />
      <CuprateSection />
    </Accordion>
  );
};

export default Selection;
