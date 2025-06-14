import { CodeHighlightTabs } from "@mantine/code-highlight";
import { SiGnubash } from "react-icons/si";

interface BashPreviewProps {
  bashCommands: string;
}

const BashPreview = ({ bashCommands }: BashPreviewProps) => {
  return (
    <CodeHighlightTabs
      code={[{
        code: bashCommands,
        language: "bash",
        fileName: "bash",
        icon: <SiGnubash />,
      }]}
      styles={{
        root: {
          overflow: "auto",
          borderRadius: "4px",
        },
      }}
    />
  );
};

export default BashPreview;
