"use server";

import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { z } from "zod/v4";
import { generateInstallationScript } from "@/lib/script-generator";

const ALLOWED_BASH_PREFIXES = [
  "cd ",
  "mkdir ",
  "curl -fsSL -o ",
  "pkg_install ",
  "pkg_update",
];

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
  bashCommands: z
    .string()
    .max(32768)
    .check(
      z.refine(
        (val) => !/^MONERO_COMPOSE_EOF$/m.test(val) && !/^MONERO_ENV_EOF$/m.test(val),
        "Contains forbidden heredoc delimiter"
      ),
      z.refine((val) => {
        const lines = val.split("\n").filter((line) => line.trim());
        return lines.every((line) => {
          if (line.startsWith("#")) return true;
          return ALLOWED_BASH_PREFIXES.some((prefix) => line.startsWith(prefix));
        });
      }, "Contains disallowed bash command")
    ),
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

  const script = generateInstallationScript(
    parsed.dockerComposeYaml,
    parsed.bashCommands,
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
