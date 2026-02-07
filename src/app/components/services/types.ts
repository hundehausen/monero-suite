import { CSSProperties } from "react";
import { AccordionStylesNames } from "@mantine/core";

export const panelStyles = {
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
} as Partial<Record<AccordionStylesNames, CSSProperties>>;
