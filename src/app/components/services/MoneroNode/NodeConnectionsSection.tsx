import { SimpleGrid, TextInput, Title } from "@mantine/core";
import { useMonerodState } from "@/hooks/services-context";
import ExplainingLabel from "../../ExplainingLabel";
import AccordionItemComponent from "../AccordionItemComponent";

const NodeConnectionsSection = () => {
  const {
    seedNode,
    setSeedNode,
    addPeer,
    setAddPeer,
    addPriorityNode,
    setAddPriorityNode,
    addExclusiveNode,
    setAddExclusiveNode,
  } = useMonerodState();

  return (
    <AccordionItemComponent
      value="node_connections"
      title={<Title order={4}>Node Connections</Title>}
    >
      <SimpleGrid cols={1} spacing="md">
        <TextInput
          label={
            <ExplainingLabel
              label="Seed Node"
              explanation="Connect to a seed node for initial peer discovery. Format: host:port"
            />
          }
          value={seedNode}
          onChange={(e) => setSeedNode(e.currentTarget.value)}
          placeholder="node.example.org:18080"
        />
        <TextInput
          label={
            <ExplainingLabel
              label="Add Peer"
              explanation="Add a peer to connect to. Multiple peers can be added by separating with commas. Format: host:port"
            />
          }
          value={addPeer}
          onChange={(e) => setAddPeer(e.currentTarget.value)}
          placeholder="peer1.example.org:18080,peer2.example.org:18080"
        />
        <TextInput
          label={
            <ExplainingLabel
              label="Add Priority Node"
              explanation="Add a priority node to maintain connection to. Multiple nodes can be added by separating with commas. Format: host:port"
            />
          }
          value={addPriorityNode}
          onChange={(e) => setAddPriorityNode(e.currentTarget.value)}
          placeholder="node1.example.org:18080,node2.example.org:18080"
        />
        <TextInput
          label={
            <ExplainingLabel
              label="Add Exclusive Node"
              explanation="Connect exclusively to specified nodes. Use this to force connections only to specific peers. Multiple nodes can be added by separating with commas. Format: host:port"
            />
          }
          value={addExclusiveNode}
          onChange={(e) => setAddExclusiveNode(e.currentTarget.value)}
          placeholder="node1.example.org:18080,node2.example.org:18080"
        />
      </SimpleGrid>
    </AccordionItemComponent>
  );
};

export default NodeConnectionsSection;
