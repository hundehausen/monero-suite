import { stringify } from "yaml";
import { CodeHighlightTabs } from "@mantine/code-highlight";
import "@mantine/code-highlight/styles.css";
import { FaDocker } from "react-icons/fa";
import { Compose } from "compose-spec-schema";
import { Button } from "@mantine/core";
import { TbDownload } from "react-icons/tb";

interface ComposePreviewProps {
  dockerCompose: Compose;
}

const ComposePreview = ({ dockerCompose }: ComposePreviewProps) => {
  const composeYaml = stringify(dockerCompose);

  const handleDownload = () => {
    const blob = new Blob([composeYaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docker-compose.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <CodeHighlightTabs
        code={[
          {
            code: composeYaml,
            language: "yaml",
            fileName: "docker-compose.yml",
            icon: <FaDocker />,
          },
        ]}
        styles={{
          root: {
            overflow: "auto",
            borderRadius: "4px",
          },
        }}
      />
      <Button
        variant="light"
        leftSection={<TbDownload />}
        onClick={handleDownload}
        mt="sm"
      >
        Download docker-compose.yml
      </Button>
    </>
  );
};

export default ComposePreview;
