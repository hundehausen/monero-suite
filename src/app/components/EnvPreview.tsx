import { CodeHighlightTabs } from "@mantine/code-highlight";
import { SiGnubash } from "react-icons/si";

interface EnvPreviewProps {
  env: string;
}

const EnvPreview = ({ env }: EnvPreviewProps) => {
  return (
    <CodeHighlightTabs
      code={{
        code: env,
        language: "TOML",
        fileName: ".env",
        icon: <SiGnubash />,
      }}
      styles={{
        root: {
          overflow: "auto",
          borderRadius: "4px",
        },
      }}
    />
  );
};

export default EnvPreview;
