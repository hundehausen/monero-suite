import { ServiceMap } from "@/hooks/use-services";
import { CSSProperties } from "react";
import { AccordionStylesNames } from "@mantine/core";

export interface ServiceComponentProps {
  services: ServiceMap;
  stateFunctions: Record<string, any>;
}

export const panelStyles = {
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
} as Partial<Record<AccordionStylesNames, CSSProperties>>;
