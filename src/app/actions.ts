"use server";

import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { stringify } from "yaml";
import { fullConfigSchema, type FullConfig } from "@/lib/config-schema";
import { generateAllServices } from "@/lib/service-generators";
import {
  generateDockerComposeFile,
  generateEnvFile,
  getFirewallPorts,
} from "@/app/utils";
import {
  generateInstallationScript,
  generateBashCommands,
} from "@/lib/script-generator";

export async function uploadInstallScript(
  config: FullConfig
): Promise<string> {
  const parsed = fullConfigSchema.parse(config);

  const services = generateAllServices(parsed);

  const architecture = parsed.architecture;
  const checkedServices = Object.values(services).filter(
    (service) =>
      service.checked !== false &&
      service.checked !== "none" &&
      service.architecture?.includes(architecture)
  );

  const dockerCompose = generateDockerComposeFile(checkedServices);
  const dockerComposeYaml = stringify(dockerCompose);

  const envString = generateEnvFile(checkedServices);

  const monitoringBashCommands = generateBashCommands(parsed.enabledBashServices);

  const isExposed = parsed.networkMode === "exposed";
  const firewallPorts = getFirewallPorts(checkedServices);

  const script = generateInstallationScript(
    dockerComposeYaml,
    monitoringBashCommands,
    envString || undefined,
    isExposed,
    firewallPorts
  );

  const configId = nanoid();
  const blob = new Blob([script], { type: "text/plain" });
  const fileName = "install.sh";
  const filePathName = `${configId}/${fileName}`;
  const file = new File([blob], fileName, { type: "text/plain" });

  await put(filePathName, file, {
    access: "public",
    addRandomSuffix: false,
  });

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  return `${baseUrl}/install/${configId}`;
}
