"use client";

import { Accordion } from "@mantine/core";
import {
  ArchitectureSection,
  NetworkModeSection,
  SystemPackagesSection,
  MoneroNodeSection,
  StagenetNodeSection,
  MoneroWalletRpcSection,
  MoneroLwsSection,
  MoneroPaySection,
  P2PoolSection,
  TraefikSection,
  TorSection,
  MonitoringSection,
  PortainerSection,
  WatchtowerSection,
  CuprateSection,
  FcmpStressnetSection,
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
        <SystemPackagesSection />
        <MoneroNodeSection />
        <StagenetNodeSection />
        <MoneroWalletRpcSection />
        <MoneroLwsSection />
        <MoneroPaySection />
        <TraefikSection />
        <P2PoolSection />
        <TorSection />
        <MonitoringSection />
        <PortainerSection />
        <WatchtowerSection />
        <CuprateSection />
        <FcmpStressnetSection />
      </Accordion>
    </>
  );
};

export default Selection;
