import { list } from "@vercel/blob";

export async function getInstallScript(configId: string): Promise<string> {
  const { blobs } = await list({ prefix: configId });

  const scriptUrl = blobs.find((blob) =>
    blob.pathname.startsWith(`${configId}/install.sh`)
  )?.downloadUrl;

  if (!scriptUrl) {
    throw new Error("Installation script not found");
  }

  return scriptUrl;
}
