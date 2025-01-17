import {
  DOCKER_INSTALLATION_TEMPLATE,
  SETUP_TEMPLATE,
  ENV_FILE_TEMPLATE,
  COMPLETION_TEMPLATE,
} from "./bash-templates";

function processCustomCommands(commands: string): string {
  return commands
    .split("\n")
    .filter((cmd) => cmd.trim())
    .map((cmd) => {
      if (cmd.startsWith("#")) {
        return `\n    ${cmd}`;
      }
      return `
    ${cmd} > /dev/null 2>&1 &
    show_spinner $! "Executing custom configuration"`;
    })
    .join("");
}

export function generateInstallationScript(
  dockerComposeUrl: string,
  customBashCommands: string,
  envFileUrl?: string
): string {
  let script = DOCKER_INSTALLATION_TEMPLATE;

  script += SETUP_TEMPLATE.replace("${DOCKER_COMPOSE_URL}", dockerComposeUrl);

  if (envFileUrl) {
    script += ENV_FILE_TEMPLATE.replace("${ENV_FILE_URL}", envFileUrl);
  }

  script += processCustomCommands(customBashCommands);
  script += COMPLETION_TEMPLATE;

  return script;
}
