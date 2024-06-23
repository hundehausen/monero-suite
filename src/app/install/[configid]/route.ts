import { installDockerForUbuntu } from "@/app/installation-script-snippets";
import { list } from "@vercel/blob";

export async function GET(
  request: Request,
  { params }: { params: { configid: string } }
) {
  const configId = params.configid;

  const { blobs } = await list({
    prefix: configId,
  });

  const dockerComposeDownloadUrl = blobs
    .filter((blob) =>
      blob.pathname.startsWith(`${configId}/docker-compose.yml`)
    )
    .at(0)?.downloadUrl;

  const bashCommandsDownloadUrl = blobs
    .filter((blob) => blob.pathname.startsWith(`${configId}/bash-commands.txt`))
    .at(0)?.downloadUrl;

  const envFileDownloadUrl = blobs
    .filter((blob) => blob.pathname.startsWith(`${configId}/.env`))
    .at(0)?.downloadUrl;

  if (!dockerComposeDownloadUrl || !bashCommandsDownloadUrl) {
    return new Response("Could not find matching config", { status: 404 });
  }

  const customBashCommands = await fetch(bashCommandsDownloadUrl).then((res) =>
    res.text()
  );

  const installationScript = generateInstallationScript(
    dockerComposeDownloadUrl,
    customBashCommands,
    envFileDownloadUrl
  );

  return new Response(installationScript);
}

const generateInstallationScript = (
  dockerComposeDownloadUrl: string,
  customBashCommands: string,
  envFileDownloadUrl?: string
) => {
  let installationScript = `#!/bin/bash\n\n`;
  installationScript = installationScript.concat(installDockerForUbuntu);

  installationScript =
    installationScript.concat(`# Create a new folder for the Monero suite
mkdir -p /opt/monero-suite

# Download the Docker Compose file and .env file
curl -sLO ${dockerComposeDownloadUrl} -o /opt/monero-suite/docker-compose.yml\n`);
  if (envFileDownloadUrl) {
    installationScript = installationScript.concat(
      `curl -sLO ${envFileDownloadUrl} -o /opt/monero-suite/.env`
    );
  }

  installationScript = installationScript.concat(customBashCommands);

  installationScript = installationScript.concat(`\n
# Start the Docker Compose file
cd /opt/monero-suite && docker compose up -d`);

  return installationScript;
};
