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
  P2PoolSection,
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
      <MoneroLwsSection />
      <TraefikSection />
      <P2PoolSection />
      <TorSection />
      <MonitoringSection />
      <PortainerSection />
      <WatchtowerSection />
      <CuprateSection />
    </Accordion>
  );
};

export default Selection;
