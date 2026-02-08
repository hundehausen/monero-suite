import {
  Checkbox,
  Input,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useServicesContext, useStagenetState, useMonerodState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const StagenetNodeSection = () => {
  const { services } = useServicesContext();
  const {
    isStagenetNode,
    setIsStagenetNode,
    isStagenetNodePublic,
    setIsStagenetNodePublic,
    isMoneroStagenetVolume,
    setIsMoneroStagenetVolume,
    moneroStagenetBlockchainLocation,
    setMoneroStagenetBlockchainLocation,
  } = useStagenetState();
  const { moneroNodeNoLogs, setMoneroNodeNoLogs } = useMonerodState();

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
        </>
      )}
    </AccordionItemComponent>
  );
};

export default StagenetNodeSection;
