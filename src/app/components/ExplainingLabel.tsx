import { ActionIcon, Group, Popover, Text, TextProps } from "@mantine/core";
import { TbInfoCircle } from "react-icons/tb";

interface ExplainingLabelProps {
  label: string;
  explanation: string;
  size?: TextProps["size"];
}

const ExplainingLabel = ({
  label,
  explanation,
  size,
}: ExplainingLabelProps) => (
  <Group gap={4} wrap="nowrap" align="center" justify="center">
    <Text span size={size}>
      {label}
    </Text>
    <Popover width={360} shadow="md" withArrow>
      <Popover.Target>
        <ActionIcon
          variant="transparent"
          size="xs"
          color="dimmed"
          aria-label="More information"
        >
          <TbInfoCircle size={14} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="sm" style={{ wordBreak: "break-word" }}>
          {explanation}
        </Text>
      </Popover.Dropdown>
    </Popover>
  </Group>
);

export default ExplainingLabel;
