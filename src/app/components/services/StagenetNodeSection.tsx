import {
  Checkbox,
  Input,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useServicesContext, useStagenetState, useMonerodState, useTraefikState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const StagenetNodeSection = () => {
  const { services } = useServicesContext();
  const {
    isStagenetNode,
    setIsStagenetNode,
    isStagenetNodePublic,
    setIsStagenetNodePublic,
    stagenetNodeDomain,
    setStagenetNodeDomain,
    isMoneroStagenetVolume,
    setIsMoneroStagenetVolume,
    moneroStagenetBlockchainLocation,
    setMoneroStagenetBlockchainLocation,
  } = useStagenetState();
  const { moneroNodeNoLogs, setMoneroNodeNoLogs } = useMonerodState();
  const { isTraefik } = useTraefikState();

  return (
    <AccordionItemComponent
      value="stagenet-node"
      title="Monero Stagenet Node"
      checked={isStagenetNode}
    >
      <Text size="sm">{services["monerod-stagenet"].description}</Text>
      <Checkbox
        checked={isStagenetNode}
        label="Monero Stagenet Node"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsStagenetNode(event.currentTarget.checked)}
      />
      {isStagenetNode && (
        <>
          <Switch
            checked={isStagenetNodePublic}
            label="Stagenet Node"
            labelPosition="left"
            onChange={(event) =>
              setIsStagenetNodePublic(event.currentTarget.checked)
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
          <Checkbox
            checked={!isMoneroStagenetVolume}
            label="Custom location for Monero stagenet blockchain"
            labelPosition="left"
            size="md"
            onChange={(event) =>
              setIsMoneroStagenetVolume(!event.currentTarget.checked)
            }
          ></Checkbox>
          {!isMoneroStagenetVolume && (
            <Input.Wrapper
              styles={{
                root: {
                  width: "100%",
                },
              }}
              description="The location where the monero blockchain will be stored."
            >
              <TextInput
                value={moneroStagenetBlockchainLocation}
                onChange={(e) =>
                  setMoneroStagenetBlockchainLocation(e.currentTarget.value)
                }
              />
            </Input.Wrapper>
          )}
          <Checkbox
            checked={moneroNodeNoLogs}
            label="Disable Monero Node logging"
            labelPosition="left"
            size="md"
            onChange={(event) =>
              setMoneroNodeNoLogs(event.currentTarget.checked)
            }
          />
          {isStagenetNodePublic && isTraefik && (
            <Input.Wrapper
              styles={{
                root: {
                  width: "100%",
                },
              }}
              label="Stagenet Node Domain"
              description="The domain where your stagenet node will be available."
            >
              <Input
                value={stagenetNodeDomain}
                onChange={(e) => setStagenetNodeDomain(e.currentTarget.value)}
              />
            </Input.Wrapper>
          )}
        </>
      )}
    </AccordionItemComponent>
  );
};

export default StagenetNodeSection;
