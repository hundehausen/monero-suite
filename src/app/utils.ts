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

const baseBashCommands = (installUfw = false) => [
  "",
  `\n\n# Install updates${installUfw ? " and UFW (firewall)" : ""}`,
  "sudo apt-get update && sudo apt-get upgrade -y",
  `sudo apt-get install -y curl wget${installUfw ? " ufw" : ""}`,
  "",
];

const ufwCommands = (allowPorts: (string | undefined)[]) => {
  let baseUfwCommands = [
    "# Deny all non-explicitly allowed ports",
    "sudo ufw default deny incoming",
    "sudo ufw default allow outgoing",
    "",
    "# Allow SSH access",
    "sudo ufw allow ssh",
  ];

  allowPorts?.forEach((allowPort) => {
    baseUfwCommands = baseUfwCommands.concat(`sudo ufw allow ${allowPort}`);
  });

  return [
    ...baseUfwCommands,
    ...["", "# Enable UFW", "sudo ufw --force enable"],
  ].flat();
};

export const generateBashScriptFile = (
  services: Service[],
  installUfw = false
) => {
  // replace two or more newlines with one newline
  const serviceBashCommands = services
    .filter((service) => service.bash)
    .map((service) => service.bash)
    .join("\n")
    .replace(/\n{2,}/g, "\n\n");

  const ufwAllowPorts = services
    .filter((service) => service.ufw)
    .map((service) => service.ufw)
    .flat();

  const bashCommands = [
    ...baseBashCommands(installUfw),
    ...(installUfw ? ufwCommands(ufwAllowPorts) : []),
    serviceBashCommands,
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
