import type { Service } from "@/hooks/use-services";
import YAML from "yaml";
import { CodeHighlightTabs } from "@mantine/code-highlight";
import { FaDocker } from "react-icons/fa";
import { Compose } from "compose-spec-schema";

let dockerCompose: Compose = {
  version: "3.8",
  name: "monero-suite",
  services: {},
  volumes: {},
};

interface ComposePreviewProps {
  services: Service[];
}

const ComposePreview = ({ services }: ComposePreviewProps) => {
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

  return (
    <CodeHighlightTabs
      code={{
        code: dockerCompose ? YAML.stringify(dockerCompose) : "",
        language: "yaml",
        fileName: "docker-compose.yml",
        icon: <FaDocker />,
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

export default ComposePreview;
