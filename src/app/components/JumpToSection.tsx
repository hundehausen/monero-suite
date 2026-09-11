"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Box, Button, Group, Kbd } from "@mantine/core";
import {
  Spotlight,
  spotlight,
  type SpotlightActionGroupData,
} from "@mantine/spotlight";
import { TbSearch } from "react-icons/tb";
import { SECTIONS } from "./services/sections";
import { useSectionFocus } from "./section-focus";

const subscribe = () => () => {};
const getIsMac = () =>
  /mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent);
const getServerIsMac = () => false;

const JumpToSection = () => {
  const { focusSection, openAdvanced } = useSectionFocus();
  const isMac = useSyncExternalStore(subscribe, getIsMac, getServerIsMac);
  const modKey = isMac ? "⌘" : "Ctrl";

  const actions = useMemo((): SpotlightActionGroupData[] => {
    return [
      {
        group: "Sections",
        actions: SECTIONS.map((section) => ({
          id: section.value,
          label: section.label,
          description: section.description,
          keywords: "keywords" in section ? [...section.keywords] : undefined,
          onClick: () => focusSection(section.value),
        })),
      },
      {
        group: "Monero node",
        actions: [
          {
            id: "advanced-config",
            label: "Advanced Configuration",
            description: "Logging, RPC, Tor, mining, and other monerod flags",
            keywords: ["logging", "rpc", "zmq", "tor", "i2p", "mining", "monerod"],
            onClick: () => {
              focusSection("mainnet-node");
              openAdvanced();
            },
          },
        ],
      },
    ];
  }, [focusSection, openAdvanced]);

  return (
    <>
      <Button
        variant="default"
        fullWidth
        justify="space-between"
        leftSection={<TbSearch size={16} />}
        rightSection={
          <Box visibleFrom="xs">
            <Group gap={4} wrap="nowrap">
              <Kbd size="xs">{modKey}</Kbd>
              <Kbd size="xs">K</Kbd>
            </Group>
          </Box>
        }
        onClick={spotlight.open}
        mb="md"
        aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
      >
        Jump to section
      </Button>
      <Spotlight
        actions={actions}
        shortcut="mod + K"
        highlightQuery
        nothingFound="No matching section"
        searchProps={{
          placeholder: "Jump to section…",
          leftSection: <TbSearch size={16} />,
        }}
      />
    </>
  );
};

export default JumpToSection;
