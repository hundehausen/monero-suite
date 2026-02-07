"use server";

import { ComposeSpecification } from "compose-spec-schema/lib/type";
import { stringify } from "yaml";
import { put } from "@vercel/blob";
import { generateBashScriptFile } from "./utils";
import { Service } from "@/hooks/use-services";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 1024 * 512;

// Security note: Blobs are stored with `access: "public"` for simplicity.
// This is acceptable because:
// 1. Config IDs are nanoid (21 chars, ~126 bits entropy) — infeasible to guess
// 2. Blobs are auto-deleted after 24 hours via the /clean cron job
// 3. No real secrets are stored — the .env contains placeholder passwords (not real ones)

export async function generateInstallationScript(
  services: Service[],
  dockerCompose: ComposeSpecification,
  envString?: string,
  isExposed = false
) {
  try {
    const configId = nanoid();

    await uploadDockerComposeFile(dockerCompose, configId);

    if (envString) {
      await uploadEnvFile(envString, configId);
    }

    await uploadBashCommandsFile(services, configId, isExposed);

    return configId;
  } catch (error) {
    console.error(
      "Failed to generate installation script:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw new Error("Failed to generate installation script");
  }
}

async function uploadDockerComposeFile(
  dockerCompose: ComposeSpecification,
  configId: string
) {
  const yamlString = stringify(dockerCompose);
  const yamlBlob = new Blob([yamlString], { type: "text/yaml" });

  if (yamlBlob.size > MAX_FILE_SIZE) {
    throw new Error("Docker compose file too large");
  }

  const fileName = `docker-compose.yml`;
  const filePathName = `${configId}/${fileName}`;
  const dockerComposeFile = new File([yamlBlob], fileName, {
    type: "text/yaml",
  });

  return put(filePathName, dockerComposeFile, {
    access: "public",
    addRandomSuffix: false,
  });
}

async function uploadEnvFile(envString: string, configId: string) {
  const envBlob = new Blob([envString], { type: "text/plain" });

  if (envBlob.size > MAX_FILE_SIZE) {
    throw new Error("Environment file too large");
  }

  const fileName = `.env`;
  const filePathName = `${configId}/${fileName}`;
  const envFile = new File([envBlob], fileName, {
    type: "text/plain",
  });

  return put(filePathName, envFile, {
    access: "public",
    addRandomSuffix: false,
  });
}

async function uploadBashCommandsFile(
  services: Service[],
  configId: string,
  isExposed = false
) {
  const bashCommands = generateBashScriptFile(services, isExposed);
  const envBlob = new Blob([bashCommands], { type: "text/plain" });

  if (envBlob.size > MAX_FILE_SIZE) {
    throw new Error("Bash commands file too large");
  }

  const fileName = `bash-commands.txt`;
  const filePathName = `${configId}/${fileName}`;
  const envFile = new File([envBlob], fileName, {
    type: "text/plain",
  });

  return put(filePathName, envFile, {
    access: "public",
    addRandomSuffix: false,
  });
}
