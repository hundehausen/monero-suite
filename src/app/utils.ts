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
  networks: {}
};

export const generateDockerComposeFile = (services: Service[]) => {
  const serviceCodes = services.map((service) => service.code);

  const volumes = services
    .filter((service) => service.volumes && service.checked)
    .map((service) => service.volumes);

  const networks = services
    .filter((service) => service.networks && service.checked)
    .map((service) => service.networks);

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
    networks: networks.reduce((acc, network) => {
      return {
        ...acc,
        ...network,
      };
    }, {}),
  } as Compose;
};


export const getFirewallPorts = (services: Service[]): string => {
  return services
    .filter((service) => service.ufw)
    .map((service) => service.ufw)
    .flat()
    .filter(Boolean)
    .join(" ");
};

export const generateBashScriptFile = (services: Service[]) => {
  return services
    .filter((service) => service.bash)
    .map((service) => service.bash)
    .join("\n")
    .replace(/\n{2,}/g, "\n\n");
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

  if (allEnvs.length === 0) return null;

  return allEnvs.map((serviceEnv) => convertToEnvString(serviceEnv)).join("\n");
};

export function generateScriptSummary(
  checkedServices: Service[],
  envString: string | null,
  isExposed: boolean,
  firewallPorts: string
): string[] {
  const steps: string[] = [];

  steps.push("Check for root/sudo privileges");
  steps.push("Detect OS and package manager");
  steps.push("Validate network environment");
  steps.push("Install Docker (skipped if already installed)");

  const serviceNames = checkedServices.map((s) => s.name);
  steps.push(
    `Write docker-compose.yml with ${serviceNames.length} service${serviceNames.length !== 1 ? "s" : ""}: ${serviceNames.join(", ")}`
  );

  if (envString) {
    steps.push("Write .env configuration file");
  }

  const hasBash = checkedServices.some((s) => s.bash);
  if (hasBash) {
    steps.push("Update system packages and install dependencies");
    steps.push("Run service-specific setup commands");
  }

  if (isExposed && firewallPorts) {
    steps.push(`Configure firewall (ports: ${firewallPorts})`);
  }

  steps.push("Pull container images and start services");

  return steps;
}
