import {
  Checkbox,
  Input,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useServicesContext, useStagenetState } from "@/hooks/services-context";
import AccordionItemComponent from "./AccordionItemComponent";

const StagenetNodeSection = () => {
  const { services } = useServicesContext();
  const {
    isStagenetNode,
    setIsStagenetNode,
    isStagenetNodePublic,
    setIsStagenetNodePublic,
    isMoneroStagenetCustomLocation,
    setIsMoneroStagenetCustomLocation,
    moneroStagenetBlockchainLocation,
    setMoneroStagenetBlockchainLocation,
  } = useStagenetState();

  const stagenetBlockchainLocationError = (): string | null => {
    if (!moneroStagenetBlockchainLocation) return null;
    if (!moneroStagenetBlockchainLocation.startsWith("/") && !moneroStagenetBlockchainLocation.startsWith("~"))
      return "Path must be absolute (e.g. /mnt/data/stagenet)";
    return null;
  };

  return (
    <AccordionItemComponent
      value="stagenet-node"
      title="Monero Stagenet Node"
      checked={isStagenetNode}
    >
      <Text size="sm">{services["monerod-stagenet"].description}</Text>
      <Checkbox
        checked={isStagenetNode}
        label="Enable Stagenet Node"
        labelPosition="left"
        size="lg"
        onChange={(event) => setIsStagenetNode(event.currentTarget.checked)}
      />
      {isStagenetNode && (
        <>
          <Switch
            checked={isStagenetNodePublic}
            label="Node Visibility"
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
            checked={isMoneroStagenetCustomLocation}
            label="Custom blockchain storage location"
            labelPosition="left"
            size="md"
            onChange={(event) =>
              setIsMoneroStagenetCustomLocation(event.currentTarget.checked)
            }
          ></Checkbox>
          {isMoneroStagenetCustomLocation && (
            <Input.Wrapper
              styles={{
                root: {
                  width: "100%",
                },
              }}
              description="The directory where stagenet blockchain data will be stored."
              error={stagenetBlockchainLocationError()}
            >
              <TextInput
                value={moneroStagenetBlockchainLocation}
                onChange={(e) =>
                  setMoneroStagenetBlockchainLocation(e.currentTarget.value)
                }
                error={!!stagenetBlockchainLocationError()}
              />
            </Input.Wrapper>
          )}
        </>
      )}
    </AccordionItemComponent>
  );
};

export default StagenetNodeSection;
