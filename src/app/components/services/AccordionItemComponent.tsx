import { ReactNode } from "react";
import { Accordion, Text } from "@mantine/core";
import { panelStyles } from "./types";

interface AccordionItemComponentProps {
  value: string;
  title: string | ReactNode;
  children: ReactNode;
  checked?: boolean;
}

const AccordionItemComponent = ({
  value,
  title,
  children,
  checked,
}: AccordionItemComponentProps) => {
  return (
    <Accordion.Item
      value={value}
      styles={
        checked
          ? { item: { borderColor: "#ff6600" } }
          : undefined
      }
    >
      <Accordion.Control>
        {typeof title === 'string' ? <Text size="lg">{title}</Text> : title}
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>
        {children}
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default AccordionItemComponent;
