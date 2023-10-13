import type { Service } from "@/hooks/use-services";
import { CodeHighlightTabs } from "@mantine/code-highlight";
import { SiGnubash } from "react-icons/si";

const baseBashCommands = [
  "sudo apt-get update && sudo apt-get upgrade -y",
  "sudo apt-get install -y ufw curl",
  "",
  "# Install Docker",
  "curl -fsSL https://get.docker.com -o get-docker.sh",
  "sudo sh get-docker.sh",
  "sudo usermod -aG docker $USER",
  "su - $USER",
  "sudo apt-get install docker-compose-plugin",
  "",
  "# Deny all non-explicitly allowed ports",
  "sudo ufw default deny incoming",
  "sudo ufw default allow outgoing",
  "",
  "# Allow SSH access",
  "sudo ufw allow ssh",
  "",
  "# Create monero-suite folder",
  "mkdir -p monero-suite",
  "cd monero-suite",
];

const finalBashCommands = [
  "# Enable UFW",
  "sudo ufw enable",
  "",
  "# finally, start the containers with:",
  `UID="$(id -u)" GID="$(id -g)"  docker compose up -d`,
];

interface BashPreviewProps {
  services: Service[];
}

const BashPreview = ({ services }: BashPreviewProps) => {
  // replace two or more newlines with one newline
  const serviceBashCommands = services
    .filter((service) => service.bash)
    .map((service) => service.bash)
    .join("\n")
    .replace(/\n{2,}/g, "\n\n");

  const bashCommands = [
    ...baseBashCommands,
    serviceBashCommands,
    ...finalBashCommands,
  ].join("\n");

  return (
    <CodeHighlightTabs
      code={{
        code: bashCommands,
        language: "bash",
        fileName: "bash",
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

export default BashPreview;
