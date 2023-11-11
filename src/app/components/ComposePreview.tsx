import type { Service } from "@/hooks/use-services";
import YAML from "yaml";
import { CodeHighlightTabs } from "@mantine/code-highlight";
import "@mantine/code-highlight/styles.css";
import { FaDocker } from "react-icons/fa";
import { Compose } from "compose-spec-schema";

const dockerComposeBase: Compose = {
  version: "3.8",
  name: "monero-suite",
  services: {},
  volumes: {},
};

const globalLogSettings = `x-log-config:
  &log-config
  logging:
    driver: json-file
    options:
      max-size: "4m"
      max-file: "3"
`;

interface ComposePreviewProps {
  services: Service[];
}

const ComposePreview = ({ services }: ComposePreviewProps) => {
  const serviceCodes = services.map((service) => service.code);

  const volumes = services
    .filter((service) => service.volumes && service.checked)
    .map((service) => service.volumes);

  const dockerCompose = {
    ...dockerComposeBase,
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
      code={[
        {
          code: dockerCompose ? YAML.stringify(dockerCompose) : "",
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
