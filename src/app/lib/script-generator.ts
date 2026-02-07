import {
  DOCKER_INSTALLATION_TEMPLATE,
  SETUP_TEMPLATE,
  ENV_FILE_TEMPLATE,
  COMPLETION_TEMPLATE,
} from "./bash-templates";

function getSpinnerMessage(cmd: string, fallback: string): string {
  // Extract filepath from curl -o <path> for a meaningful message
  const curlMatch = cmd.match(/curl\s.*-o\s+(\S+)/);
  if (curlMatch) {
    const filepath = curlMatch[1];
    const parts = filepath.split("/");
    const filename = parts.pop() || filepath;
    const parent = parts.pop();
    // Include parent dir for context (e.g. "dashboards/all.yaml" vs "datasources/all.yaml")
    const label = parent ? `${parent}/${filename}` : filename;
    return `Downloading ${label}`;
  }

  // Extract package names from pkg_install
  const pkgMatch = cmd.match(/^pkg_install\s+(.+)$/);
  if (pkgMatch) {
    return `Installing packages: ${pkgMatch[1]}`;
  }

  if (cmd.startsWith("pkg_update")) {
    return "Updating system packages";
  }

  // mkdir
  if (cmd.startsWith("mkdir")) {
    return "Creating directories";
  }

  return fallback;
}

function processCustomCommands(commands: string): string {
  let currentDescription = "Running service configuration";
  const lines = commands.split("\n").filter((cmd) => cmd.trim());

  return lines
    .map((cmd) => {
      if (cmd.startsWith("#")) {
        currentDescription = cmd.replace(/^#\s*/, "");
        return `\n    ${cmd}`;
      }

      // cd must run in the foreground — backgrounding it in a subshell has no effect
      if (cmd.startsWith("cd ")) {
        return `\n    ${cmd}`;
      }

      const message = getSpinnerMessage(cmd, currentDescription);

      return `
    run_cmd ${cmd} &
    show_spinner $! "${message}"`;
    })
    .join("");
}

export function generateInstallationScript(
  dockerComposeUrl: string,
  customBashCommands: string,
  envFileUrl?: string,
  isExposed = false,
  firewallPorts = ""
): string {
  let script = DOCKER_INSTALLATION_TEMPLATE.replace(
    "${NETWORK_MODE_PLACEHOLDER}",
    isExposed ? "exposed" : "local"
  ).replace("${FIREWALL_PORTS_PLACEHOLDER}", firewallPorts);

  script += SETUP_TEMPLATE.replace("${DOCKER_COMPOSE_URL}", dockerComposeUrl);

  if (envFileUrl) {
    script += ENV_FILE_TEMPLATE.replace("${ENV_FILE_URL}", envFileUrl);
  }

  script += processCustomCommands(customBashCommands);
  script += COMPLETION_TEMPLATE;

  return script;
}
