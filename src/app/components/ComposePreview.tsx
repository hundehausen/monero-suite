import { stringify } from "yaml";
import { CodeHighlightTabs } from "@mantine/code-highlight";
import "@mantine/code-highlight/styles.css";
import { FaDocker } from "react-icons/fa";
import { Compose } from "compose-spec-schema";

interface ComposePreviewProps {
  dockerCompose: Compose;
}

const ComposePreview = ({ dockerCompose }: ComposePreviewProps) => {
  return (
    <CodeHighlightTabs
      code={[
        {
          code: stringify(dockerCompose),
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
  );
};

export default ComposePreview;
