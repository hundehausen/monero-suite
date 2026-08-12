"use client";

import {
  Anchor,
  Text,
  Checkbox,
  Code,
  Stack,
} from "@mantine/core";
import { useServicesContext, useMoneroLwsState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const MoneroLwsSection = () => {
  const { services } = useServicesContext();
  const {
    isMoneroLws,
    setIsMoneroLws,
  } = useMoneroLwsState();

  return (
    <AccordionItemComponent
      value="monero-lws"
      checked={isMoneroLws}
      title="Light Wallet Server"
    >
      <Text size="sm">{services["monero-lws"].description}</Text>
      <Anchor href="https://github.com/vtnerd/monero-lws" target="_blank">
        Learn more about monero-lws.
      </Anchor>

      <Checkbox
        checked={isMoneroLws}
        label="Enable monero-lws"
        labelPosition="left"
        onChange={(event) =>
          setIsMoneroLws(event.currentTarget.checked)
        }
        size="lg"
      />

      <Text size="sm">
        Light wallets connect on port 8443. New accounts must be approved on the
        admin API on port 8081:
      </Text>
      <Stack gap={4}>
        <Code block>
          docker compose exec monero-lws monero-lws-admin list_requests
        </Code>
        <Code block>
          docker compose exec monero-lws monero-lws-admin accept_requests create ADDRESS
        </Code>
      </Stack>
    </AccordionItemComponent>
  );
};

export default MoneroLwsSection;
