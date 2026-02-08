import {
  DOCKER_INSTALLATION_TEMPLATE,
  SETUP_TEMPLATE,
  ENV_FILE_TEMPLATE,
  COMPLETION_TEMPLATE,
} from "./bash-templates";

export const BASE_BASH_COMMANDS = `

# Update system packages
pkg_update
# Install required packages
pkg_install curl`;

export const MONITORING_BASH_COMMANDS = `
# Set up monitoring configuration
cd ~/monero-suite
mkdir -p monitoring/grafana/dashboards monitoring/grafana/provisioning/{dashboards,datasources,plugins,alerting} monitoring/prometheus
# Download Prometheus and Grafana configs
curl -fsSL -o monitoring/prometheus/config.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/prometheus/config.yaml
curl -fsSL -o monitoring/grafana/grafana.ini https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/grafana.ini
# Download Grafana dashboards and provisioning
curl -fsSL -o monitoring/grafana/dashboards/node_stats.json https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/dashboards/node_stats.json
curl -fsSL -o monitoring/grafana/provisioning/dashboards/all.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/provisioning/dashboards/all.yaml
curl -fsSL -o monitoring/grafana/provisioning/datasources/all.yaml https://raw.githubusercontent.com/lalanza808/docker-monero-node/master/files/grafana/provisioning/datasources/all.yaml`;

export interface EnabledBashServices {
  monitoring: boolean;
}

export function generateBashCommands(services: EnabledBashServices): string {
  let commands = BASE_BASH_COMMANDS;
  if (services.monitoring) {
    commands += "\n" + MONITORING_BASH_COMMANDS;
  }
  return commands;
}

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
  dockerComposeYaml: string,
  customBashCommands: string,
  envContent?: string,
  isExposed = false,
  firewallPorts = ""
): string {
  let script = DOCKER_INSTALLATION_TEMPLATE.replace(
    "${NETWORK_MODE_PLACEHOLDER}",
    isExposed ? "exposed" : "local"
  ).replace("${FIREWALL_PORTS_PLACEHOLDER}", firewallPorts);

  script += SETUP_TEMPLATE.replace(
    "${DOCKER_COMPOSE_CONTENT}",
    dockerComposeYaml
  );

  if (envContent) {
    script += ENV_FILE_TEMPLATE.replace("${ENV_CONTENT}", envContent);
  }

  script += processCustomCommands(customBashCommands);
  script += COMPLETION_TEMPLATE;

  return script;
}
