import { ReactNode } from "react";
import { Accordion, Badge, Group, Text } from "@mantine/core";
import { panelStyles } from "./types";
import { sectionElementId } from "./sections";

interface AccordionItemComponentProps {
  value: string;
  title: string | ReactNode;
  children: ReactNode;
  checked?: boolean;
  alwaysOn?: boolean;
}

const AccordionItemComponent = ({
  value,
  title,
  children,
  checked,
  alwaysOn,
}: AccordionItemComponentProps) => {
  return (
    <Accordion.Item
      id={sectionElementId(value)}
      value={value}
      styles={{
        item: {
          scrollMarginTop:
            "calc(var(--app-shell-header-offset, 4rem) + 12px)",
          ...(checked
            ? { borderColor: "var(--mantine-color-monero-orange-6)" }
            : {}),
        },
      }}
    >
      <Accordion.Control>
        <Group gap="sm" wrap="nowrap">
          {typeof title === "string" ? <Text size="lg">{title}</Text> : title}
          {alwaysOn ? (
            <Badge size="xs" variant="light" color="gray">
              Always on
            </Badge>
          ) : null}
        </Group>
      </Accordion.Control>
      <Accordion.Panel styles={panelStyles}>{children}</Accordion.Panel>
    </Accordion.Item>
  );
};

export default AccordionItemComponent;
