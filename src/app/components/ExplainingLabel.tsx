import { HoverCard, Text, TextProps } from "@mantine/core";

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
  <HoverCard width={280} shadow="md" openDelay={300}>
    <HoverCard.Target>
      <Text
        span
        size={size}
        style={{
          cursor: "pointer",
          position: "relative",
        }}
      >
        {label}
      </Text>
    </HoverCard.Target>
    <HoverCard.Dropdown>
      <Text size="sm">{explanation}</Text>
    </HoverCard.Dropdown>
  </HoverCard>
);

export default ExplainingLabel;
