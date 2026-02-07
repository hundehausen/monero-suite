import { getConfigFiles } from "@/app/lib/config-files";
import { generateInstallationScript } from "@/app/lib/script-generator";

const MAX_BASH_COMMANDS_SIZE = 512 * 1024; // 512KB
const FETCH_TIMEOUT_MS = 10_000; // 10 seconds

export async function GET(
  request: Request,
  props: { params: Promise<{ configid: string }> }
) {
  try {
    const params = await props.params;
    const { dockerComposeUrl, bashCommandsUrl, envFileUrl, settingsUrl } =
      await getConfigFiles(params.configid);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let customBashCommands: string;
    try {
      const response = await fetch(bashCommandsUrl, {
        signal: controller.signal,
      });

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > MAX_BASH_COMMANDS_SIZE) {
        return new Response("Bash commands file too large", { status: 413 });
      }

      customBashCommands = await response.text();
    } finally {
      clearTimeout(timeout);
    }

    let isExposed = false;
    let firewallPorts = "";

    if (settingsUrl) {
      const settingsController = new AbortController();
      const settingsTimeout = setTimeout(
        () => settingsController.abort(),
        FETCH_TIMEOUT_MS
      );

      try {
        const settingsResponse = await fetch(settingsUrl, {
          signal: settingsController.signal,
        });
        const settingsText = await settingsResponse.text();
        const settings: Record<string, string> = {};
        for (const line of settingsText.split("\n")) {
          const [key, ...rest] = line.split("=");
          if (key) settings[key.trim()] = rest.join("=").trim();
        }
        isExposed = settings.NETWORK_MODE === "exposed";
        firewallPorts = settings.FIREWALL_PORTS || "";
      } finally {
        clearTimeout(settingsTimeout);
      }
    }

    const installationScript = generateInstallationScript(
      dockerComposeUrl,
      customBashCommands,
      envFileUrl,
      isExposed,
      firewallPorts
    );

    return new Response(installationScript);
  } catch (error) {
    return new Response(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 404 }
    );
  }
}
