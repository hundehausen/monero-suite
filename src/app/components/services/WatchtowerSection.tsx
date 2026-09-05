"use client";

import { Checkbox, SegmentedControl, Text } from "@mantine/core";
import {
  watchtowerUpdateFrequencies,
  watchtowerCooldownDelays,
  type WatchtowerUpdateFrequency,
  type WatchtowerCooldownDelay,
} from "@/hooks/use-services";
import { useServicesContext, useWatchtowerState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const isWatchtowerUpdateFrequency = (
  value: string
): value is WatchtowerUpdateFrequency =>
  value === watchtowerUpdateFrequencies.hourly ||
  value === watchtowerUpdateFrequencies.daily ||
  value === watchtowerUpdateFrequencies.weekly;

const isWatchtowerCooldownDelay = (
  value: string
): value is WatchtowerCooldownDelay =>
  value === watchtowerCooldownDelays.none ||
  value === watchtowerCooldownDelays["12h"] ||
  value === watchtowerCooldownDelays["24h"] ||
  value === watchtowerCooldownDelays["3d"] ||
  value === watchtowerCooldownDelays["7d"];

const WatchtowerSection = () => {
  const { services } = useServicesContext();
  const {
    isWatchtower,
    setIsWatchtower,
    watchtowerUpdateFrequency,
    setWatchtowerUpdateFrequency,
    watchtowerCooldownDelay,
    setWatchtowerCooldownDelay,
  } = useWatchtowerState();

  return (
    <AccordionItemComponent
      value="watchtower"
      title="Watchtower"
      checked={isWatchtower}
    >
      <Text size="sm">{services["watchtower"].description}</Text>
      <Checkbox
        checked={isWatchtower}
        label="Watchtower"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsWatchtower(event.currentTarget.checked)}
      />
      {isWatchtower && (
        <>
          <Text size="md">Update frequency</Text>
          <Text size="sm" c="dimmed">
            How often Watchtower checks for new image versions and restarts
            containers that have updates.
          </Text>
          <SegmentedControl
            value={watchtowerUpdateFrequency}
            fullWidth
            onChange={(value) => {
              if (isWatchtowerUpdateFrequency(value)) {
                setWatchtowerUpdateFrequency(value);
              }
            }}
            styles={{
              label: {
                fontSize: "16px",
              },
            }}
            data={[
              { label: "Hourly", value: watchtowerUpdateFrequencies.hourly },
              { label: "Daily", value: watchtowerUpdateFrequencies.daily },
              { label: "Weekly", value: watchtowerUpdateFrequencies.weekly },
            ]}
          />
          <Text size="md">Image cooldown</Text>
          <Text size="sm" c="dimmed">
            Skip images newer than this. Gives time for a bad registry push to
            be yanked. Also delays security patches.
          </Text>
          <SegmentedControl
            value={watchtowerCooldownDelay}
            fullWidth
            onChange={(value) => {
              if (isWatchtowerCooldownDelay(value)) {
                setWatchtowerCooldownDelay(value);
              }
            }}
            styles={{
              label: {
                fontSize: "14px",
              },
            }}
            data={[
              { label: "None", value: watchtowerCooldownDelays.none },
              { label: "12h", value: watchtowerCooldownDelays["12h"] },
              { label: "24h", value: watchtowerCooldownDelays["24h"] },
              { label: "3d", value: watchtowerCooldownDelays["3d"] },
              { label: "7d", value: watchtowerCooldownDelays["7d"] },
            ]}
          />
        </>
      )}
    </AccordionItemComponent>
  );
};

export default WatchtowerSection;
