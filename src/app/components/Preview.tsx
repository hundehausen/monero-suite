import type { Service } from "@/hooks/use-services";
import YAML from "yaml";
import { Space } from "@mantine/core";
import { CodeHighlightTabs } from "@mantine/code-highlight";
import { FaDocker } from "react-icons/fa";
import { SiGnubash } from "react-icons/si";
import { Compose } from "compose-spec-schema";

let dockerCompose: Compose = {
  version: "3.8",
  name: "monero-suite",
  services: {},
  volumes: {},
};

const baseBashCommands = [
  "sudo apt-get update && sudo apt-get upgrade -y",
  "sudo apt-get install -y ufw curl",
  "",
  "# Install Docker",
  "curl -fsSL https://get.docker.com -o get-docker.sh",
  "sudo sh get-docker.sh",
  "sudo usermod -aG docker $USER",
  "su - $USER",
  "",
  "# Deny all non-explicitly allowed ports",
  "sudo ufw default deny incoming",
  "sudo ufw default allow outgoing",
  "",
  "# Allow SSH access",
  "sudo ufw allow ssh",
];

const finalBashCommands = [
  "# Enable UFW",
  "sudo ufw enable",
  "",
  "# change directory to where the docker-compose.yml file is located",
  "cd ~/monero-suite",
  "# finally, start the containers with:",
  "docker-compose up -d",
];

interface PreviewProps {
  services: Service[];
}

const Preview = ({ services }: PreviewProps) => {
  const serviceCodes = services.map((service) => service.code);

  const volumes = services
    .filter((service) => service.volumes)
    .map((service) => service.volumes);

  dockerCompose = {
    ...dockerCompose,
    services: serviceCodes.reduce((acc, service) => {
      return {
        ...acc,
        ...service,
      };
    }, {}),
    volumes: volumes.reduce((acc, volume) => {
      return {
        ...acc,
        ...volume,
      };
    }, {}),
  };

  // replance two or more newlines with one newline
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
    <>
      <CodeHighlightTabs
        code={{
          code: dockerCompose ? YAML.stringify(dockerCompose) : "",
          language: "yaml",
          fileName: "docker-compose.yml",
          icon: <FaDocker />,
        }}
        styles={{
          root: {
            height: "350px",
            maxHeight: "350px",
            overflow: "auto",
          },
        }}
      />
      <Space h={20} />

      <CodeHighlightTabs
        code={{
          code: bashCommands,
          language: "bash",
          fileName: "bash",
          icon: <SiGnubash />,
        }}
        styles={{
          root: {
            maxHeight: "200px",
            overflow: "auto",
          },
        }}
      />
    </>
  );
};

export default Preview;
