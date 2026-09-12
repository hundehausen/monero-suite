"use client";

import { Accordion } from "@mantine/core";
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
import JumpToSection from "./JumpToSection";
import { useSectionFocus } from "./section-focus";

const Selection = () => {
  const { accordionItems, setAccordionItems } = useSectionFocus();

  return (
    <>
      <JumpToSection />
      {/* Accordion `value`s must stay listed in SECTIONS (services/sections.ts). */}
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
    </>
  );
};

export default Selection;
