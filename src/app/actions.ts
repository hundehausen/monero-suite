"use server";

import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { z } from "zod/v4";
import { generateInstallationScript, generateBashCommands } from "@/lib/script-generator";

const installScriptInputSchema = z.object({
  dockerComposeYaml: z
    .string()
    .max(65536)
    .check(
      z.refine(
        (val) => !/^MONERO_COMPOSE_EOF$/m.test(val),
        "Contains forbidden heredoc delimiter"
      )
    ),
  enabledBashServices: z.object({
    monitoring: z.boolean(),
  }),
  envContent: z
    .string()
    .max(8192)
    .check(
      z.refine(
        (val) => !/^MONERO_ENV_EOF$/m.test(val),
        "Contains forbidden heredoc delimiter"
      )
    )
    .optional(),
  isExposed: z.boolean(),
  firewallPorts: z
    .string()
    .max(512)
    .regex(/^(\d{1,5}\/(tcp|udp)(\s+\d{1,5}\/(tcp|udp))*)?$/),
});

export type InstallScriptInput = z.infer<typeof installScriptInputSchema>;

export async function uploadInstallScript(
  input: InstallScriptInput
): Promise<string> {
  const parsed = installScriptInputSchema.parse(input);

  const bashCommands = generateBashCommands(parsed.enabledBashServices);

  const script = generateInstallationScript(
    parsed.dockerComposeYaml,
    bashCommands,
    parsed.envContent,
    parsed.isExposed,
    parsed.firewallPorts
  );

  const configId = nanoid();
  const blob = new Blob([script], { type: "text/plain" });
  const fileName = "install.sh";
  const filePathName = `${configId}/${fileName}`;
  const file = new File([blob], fileName, { type: "text/plain" });

  await put(filePathName, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return configId;
}
