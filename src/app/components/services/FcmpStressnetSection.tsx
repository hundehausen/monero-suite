"use client";

import { Alert, Anchor, Badge, Checkbox, Switch, Text } from "@mantine/core";
import { useServicesContext, useFcmpStressnetState } from "@/hooks/services-context";
import { MONEROD_FCMP_STRESSNET_PORTS } from "@/lib/constants";
import AccordionItemComponent from "./AccordionItemComponent";

const FcmpStressnetSection = () => {
  const { services } = useServicesContext();
  const {
    isFcmpStressnet,
    setIsFcmpStressnet,
    isFcmpStressnetPublic,
    setIsFcmpStressnetPublic,
    isFcmpStressnetPruned,
    setIsFcmpStressnetPruned,
  } = useFcmpStressnetState();

  return (
    <AccordionItemComponent
      value="fcmp-stressnet-node"
      checked={isFcmpStressnet}
      title={
        <>
          FCMP++ Stressnet Node
          <Badge color="red" size="sm" ml={8}>Experimental</Badge>
        </>
      }
    >
      <Text size="sm">{services["monerod-fcmp-stressnet"].description}</Text>
      <Anchor href="https://github.com/hundehausen/monero-fcmp-docker" target="_blank">
        Learn more about the FCMP++ stressnet image.
      </Anchor>

      <Checkbox
        checked={isFcmpStressnet}
        label="Enable FCMP++ Stressnet Node"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsFcmpStressnet(event.currentTarget.checked)}
      />

      {isFcmpStressnet && (
        <>
          <Alert color="red" variant="light" title="Beta software">
            FCMP++ wallets must connect to an FCMP++ daemon. Watch-only wallets,
            hardware wallets, multisig, and transaction proofs do not work yet.
          </Alert>
          <Switch
            checked={isFcmpStressnetPublic}
            label="Node Visibility"
            labelPosition="left"
            onChange={(event) =>
              setIsFcmpStressnetPublic(event.currentTarget.checked)
            }
            onLabel="Public"
            offLabel="Private"
            size="lg"
            styles={{ track: { width: "70px" } }}
          />
          <Checkbox
            checked={isFcmpStressnetPruned}
            label="Prune blockchain"
            labelPosition="left"
            size="md"
            onChange={(event) =>
              setIsFcmpStressnetPruned(event.currentTarget.checked)
            }
          />
          <Text size="sm" c="dimmed">
            P2P port {MONEROD_FCMP_STRESSNET_PORTS.p2p}, restricted RPC port{" "}
            {MONEROD_FCMP_STRESSNET_PORTS.rpcRestricted}.
          </Text>
        </>
      )}
    </AccordionItemComponent>
  );
};

export default FcmpStressnetSection;
