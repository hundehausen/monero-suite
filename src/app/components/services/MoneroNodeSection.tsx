"use client";

import {
  Button,
  Group,
  Switch,
  Text,
} from "@mantine/core";
import { useServicesContext, useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../ExplainingLabel";
import AccordionItemComponent from "./AccordionItemComponent";
import { useSectionFocus } from "../section-focus";
import { ADVANCED_CONFIG_ID } from "./MoneroNode/AdvancedConfigModal";

const MoneroNodeSection = () => {
  const { services } = useServicesContext();
  const { advancedOpened, toggleAdvanced } = useSectionFocus();
  const {
    isMoneroPublicNode,
    setIsMoneroPublicNode,
    isPrunedNode,
    setIsPrunedNode,
  } = useMonerodState();

  return (
    <AccordionItemComponent
      value="mainnet-node"
      title="Monero Node"
      alwaysOn
    >
      <Text size="sm">{services["monerod"].description}</Text>
      <Switch
        checked={isMoneroPublicNode}
        label="Node Visibility"
        labelPosition="left"
        onChange={(event) =>
          setIsMoneroPublicNode(event.currentTarget.checked)
        }
        onLabel="Public"
        offLabel="Private"
        size="lg"
        styles={{
          track: {
            width: "70px",
          },
        }}
      />
      <Switch
        checked={isPrunedNode}
        label={
          <ExplainingLabel
            label="Storage Mode"
            explanation="Pruning reduces blockchain storage by 2/3 while keeping the full transaction history. Your node stays fully functional with no privacy or security trade-offs."
          />
        }
        labelPosition="left"
        onChange={(event) => setIsPrunedNode(event.currentTarget.checked)}
        onLabel="Pruned"
        offLabel="Full"
        size="lg"
        styles={{
          track: {
            width: "70px",
          },
        }}
      />

      <Group mt="md">
        <Button
          onClick={toggleAdvanced}
          variant="outline"
          aria-expanded={advancedOpened}
          aria-controls={ADVANCED_CONFIG_ID}
          styles={{
            root: {
              height: "auto",
              minHeight: "var(--button-height)",
              maxWidth: "100%",
            },
            label: { whiteSpace: "normal" },
          }}
        >
          {advancedOpened
            ? "Close Advanced Configuration"
            : "Advanced Configuration"}
        </Button>
      </Group>
    </AccordionItemComponent>
  );
};

export default MoneroNodeSection;
