import type { Service } from "@/hooks/use-services";
import { Compose } from "compose-spec-schema";

const globalLogSettings = `x-log-config:
  &log-config
  logging:
    driver: json-file
    options:
      max-size: "4m"
      max-file: "3"
`;

const dockerComposeBase: Compose = {
  name: "monero-suite",
  services: {},
  volumes: {},
};

export const generateDockerComposeFile = (services: Service[]) => {
  const serviceCodes = services.map((service) => service.code);

  const volumes = services
    .filter((service) => service.volumes && service.checked)
    .map((service) => service.volumes);

  return {
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
  } as Compose;
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
  "",
  "# Enable UFW",
  "sudo ufw enable",
  "",
  "# finally, start the containers with:",
  `UID="$(id -u)" GID="$(id -g)" docker compose up -d`,
];

export const generateBashScriptFile = (services: Service[]) => {
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

  return bashCommands;
};

function convertToEnvString(obj: {
  [key: string]: string | number | boolean;
}): string {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export const generateEnvFile = (services: Service[]) => {
  const allEnvs = services
    .filter((service) => service.env)
    .map((service) => service.env)
    .filter(
      (env): env is { [key: string]: string | number | boolean } =>
        env !== undefined
    );

  return allEnvs.map((serviceEnv) => convertToEnvString(serviceEnv)).join("\n");
};
