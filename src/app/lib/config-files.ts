import { list } from "@vercel/blob";

export type ConfigFiles = {
  dockerComposeUrl: string;
  bashCommandsUrl: string;
  envFileUrl?: string;
  settingsUrl?: string;
};

export async function getConfigFiles(configId: string): Promise<ConfigFiles> {
  const { blobs } = await list({ prefix: configId });

  const dockerComposeUrl = blobs.find((blob) =>
    blob.pathname.startsWith(`${configId}/docker-compose.yml`)
  )?.downloadUrl;

  const bashCommandsUrl = blobs.find((blob) =>
    blob.pathname.startsWith(`${configId}/bash-commands.txt`)
  )?.downloadUrl;

  const envFileUrl = blobs.find((blob) =>
    blob.pathname.startsWith(`${configId}/.env`)
  )?.downloadUrl;

  const settingsUrl = blobs.find((blob) =>
    blob.pathname.startsWith(`${configId}/settings.conf`)
  )?.downloadUrl;

  if (!dockerComposeUrl || !bashCommandsUrl) {
    throw new Error("Required configuration files not found");
  }

  return {
    dockerComposeUrl,
    bashCommandsUrl,
    envFileUrl,
    settingsUrl,
  };
}
