import { getConfigFiles } from "@/app/lib/config-files";
import { generateInstallationScript } from "@/app/lib/script-generator";

export async function GET(
  request: Request,
  props: { params: Promise<{ configid: string }> }
) {
  try {
    const params = await props.params;
    const { dockerComposeUrl, bashCommandsUrl, envFileUrl } =
      await getConfigFiles(params.configid);

    const customBashCommands = await fetch(bashCommandsUrl).then((res) =>
      res.text()
    );

    const installationScript = generateInstallationScript(
      dockerComposeUrl,
      customBashCommands,
      envFileUrl
    );

    return new Response(installationScript);
  } catch (error) {
    return new Response(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 404 }
    );
  }
}
