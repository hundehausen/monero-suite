"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  DEFAULT_OPEN_SECTIONS,
  ensureSectionOpen,
  sectionElementId,
} from "./services/sections";

type SectionFocusContextValue = {
  accordionItems: string[];
  setAccordionItems: Dispatch<SetStateAction<string[]>>;
  focusSection: (value: string) => void;
  advancedOpened: boolean;
  openAdvanced: () => void;
  closeAdvanced: () => void;
};

const SectionFocusContext = createContext<SectionFocusContextValue | null>(
  null
);

function scrollToSection(value: string): void {
  document.getElementById(sectionElementId(value))?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function SectionFocusProvider({ children }: { children: ReactNode }) {
  const [accordionItems, setAccordionItems] = useState<string[]>(() => [
    ...DEFAULT_OPEN_SECTIONS,
  ]);
  const [advancedOpened, { open: openAdvanced, close: closeAdvanced }] =
    useDisclosure(false);

  const focusSection = useCallback((value: string) => {
    setAccordionItems((open) => ensureSectionOpen(open, value));
    requestAnimationFrame(() => scrollToSection(value));
  }, []);

  const value = useMemo(
    (): SectionFocusContextValue => ({
      accordionItems,
      setAccordionItems,
      focusSection,
      advancedOpened,
      openAdvanced,
      closeAdvanced,
    }),
    [
      accordionItems,
      focusSection,
      advancedOpened,
      openAdvanced,
      closeAdvanced,
    ]
  );

  return (
    <SectionFocusContext.Provider value={value}>
      {children}
    </SectionFocusContext.Provider>
  );
}

export function useSectionFocus(): SectionFocusContextValue {
  const ctx = useContext(SectionFocusContext);
  if (!ctx) {
    throw new Error("useSectionFocus must be used within SectionFocusProvider");
  }
  return ctx;
}
