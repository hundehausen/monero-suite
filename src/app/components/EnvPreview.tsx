import { CodeHighlightTabs } from "@mantine/code-highlight";
import { SiGnubash } from "react-icons/si";
import { Button } from "@mantine/core";
import { TbDownload } from "react-icons/tb";

interface EnvPreviewProps {
  env: string;
}

const EnvPreview = ({ env }: EnvPreviewProps) => {
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
          language: "TOML",
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
      <Button
        variant="light"
        leftSection={<TbDownload />}
        onClick={handleDownload}
        mt="sm"
      >
        Download .env
      </Button>
    </>
  );
};

export default EnvPreview;
