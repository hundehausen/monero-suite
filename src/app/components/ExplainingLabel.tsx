import { HoverCard, Text } from "@mantine/core";

interface ExplainingLabelProps {
  label: string;
  explanation: string;
}

const ExplainingLabel = ({ label, explanation }: ExplainingLabelProps) => (
  <HoverCard width={280} shadow="md">
    <HoverCard.Target>
      <Text
        style={{
          cursor: "pointer",
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
