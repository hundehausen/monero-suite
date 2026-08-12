"use client";

import { Alert, Checkbox, Text, Tooltip } from "@mantine/core";
import {
  useServicesContext,
  useXmrigProxyState,
  useP2PoolState,
  useArchitectureState,
} from "@/hooks/services-context";
import ExplainingLabel from "../ExplainingLabel";
import AccordionItemComponent from "./AccordionItemComponent";
import { architectures } from "@/hooks/services/types";

const XmrigProxySection = () => {
  const { services } = useServicesContext();
  const { isXmrigProxy, setIsXmrigProxy, isXmrigProxyPublic, setIsXmrigProxyPublic } =
    useXmrigProxyState();
  const { p2PoolMode } = useP2PoolState();
  const { architecture } = useArchitectureState();

  const isAmd64 = architecture === architectures.linuxAmd;
  const hasP2Pool = p2PoolMode !== "none";
  const enabled = hasP2Pool && isAmd64;
  const description =
    services["xmrig-proxy"]?.description ??
    "Stratum proxy in front of your P2Pool node. Point many miners at one connection.";

  return (
    <AccordionItemComponent
      value="xmrig-proxy"
      title="XMRig-proxy"
      checked={isXmrigProxy}
    >
      <Text size="sm">{description}</Text>

      {!isAmd64 && (
        <Alert variant="light" color="yellow" title="AMD64 only" mt="sm">
          XMRig-proxy does not publish ARM64 images. Switch architecture to
          Linux AMD64 to enable it.
        </Alert>
      )}
      {isAmd64 && !hasP2Pool && (
        <Alert variant="light" color="yellow" title="P2Pool required" mt="sm">
          Enable P2Pool first — XMRig-proxy fronts your P2Pool stratum.
        </Alert>
      )}

      <Checkbox
        mt="md"
        checked={isXmrigProxy}
        disabled={!enabled}
        label={
          <Tooltip
            label={
              !isAmd64
                ? "XMRig-proxy does not have ARM64 builds."
                : "Enable P2Pool first — XMRig-proxy fronts your P2Pool stratum."
            }
            disabled={enabled}
          >
            <span>Enable XMRig-proxy</span>
          </Tooltip>
        }
        labelPosition="left"
        onChange={(event) => setIsXmrigProxy(event.currentTarget.checked)}
        size="lg"
      />

      {isXmrigProxy && enabled && (
        <Checkbox
          mt="md"
          checked={isXmrigProxyPublic}
          label={
            <ExplainingLabel
              label="Publish stratum publicly"
              explanation="Anyone who can reach port 3334 on this host can point miners at the proxy. Only enable this if you want to let external miners connect. In-container miners (XMRig) and other devices on your local network reach the proxy without it."
            />
          }
          onChange={(event) =>
            setIsXmrigProxyPublic(event.currentTarget.checked)
          }
        />
      )}
    </AccordionItemComponent>
  );
};

export default XmrigProxySection;
