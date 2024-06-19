"use server";

import { ComposeSpecification } from "compose-spec-schema/lib/type";
import { stringify } from "yaml";
import { put } from "@vercel/blob";

export async function generateInstallationScript(
  configId: string,
  dockerCompose: ComposeSpecification,
  bashCommands: string,
  envString?: string
) {
  try {
    const uploadDockerComposeFileResult = await uploadDockerComposeFile(
      dockerCompose,
      configId
    );

    const uploadEnvFileResult = envString
      ? await uploadEnvFile(envString, configId)
      : undefined;

    const uploadBashCommandsResult = await uploadBashCommandsFile(
      bashCommands,
      configId
    );

    return {
      uploadDockerComposeFileResult,
      uploadEnvFileResult,
      uploadBashCommandsResult,
    };
  } catch (error) {
    console.error(error);
  }
}

async function uploadDockerComposeFile(
  dockerCompose: ComposeSpecification,
  configId: string
) {
  const yamlString = stringify(dockerCompose);
  const yamlBlob = new Blob([yamlString], { type: "text/yaml" });
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

async function uploadBashCommandsFile(bashCommands: string, configId: string) {
  const envBlob = new Blob([bashCommands], { type: "text/plain" });
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
