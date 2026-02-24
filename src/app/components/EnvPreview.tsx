import { CodeHighlightTabs } from "@mantine/code-highlight";
import { SiGnubash } from "react-icons/si";
import { Button, Tooltip } from "@mantine/core";
import { TbDownload } from "react-icons/tb";

interface EnvPreviewProps {
  env: string;
  hasDefaultDomain?: boolean;
}

const EnvPreview = ({ env, hasDefaultDomain = false }: EnvPreviewProps) => {
  const handleDownload = () => {
    const blob = new Blob([env], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <CodeHighlightTabs
        code={[{
          code: env,
          language: "ini",
          fileName: ".env",
          icon: <SiGnubash />,
        }]}
        styles={{
          root: {
            overflow: "auto",
            borderRadius: "4px",
          },
        }}
      />
      <Tooltip
        label="Replace all example.com domains in the Traefik section first"
        disabled={!hasDefaultDomain}
      >
        <Button
          variant="light"
          leftSection={<TbDownload />}
          onClick={handleDownload}
          mt="sm"
          disabled={hasDefaultDomain}
        >
          Download .env
        </Button>
      </Tooltip>
    </>
  );
};

export default EnvPreview;
