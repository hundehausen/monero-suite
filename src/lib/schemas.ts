import { z } from "zod/v4";

const noShellMeta = (val: string) => !/[;&|`$(){}[\]!<>\\'"]/.test(val);

export const domainSchema = z
  .string()
  .trim()
  .max(253)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/)
  .or(z.literal(""));

export const hostPortSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9._-]+(:[0-9]{1,5})?$/)
  .or(z.string().regex(/^[a-z2-7]{56}\.onion(:[0-9]{1,5})?$/))
  .or(z.literal(""));

export const commandValueSchema = z
  .string()
  .trim()
  .check(
    z.refine(noShellMeta, "Contains shell metacharacters"),
  )
  .or(z.literal(""));

export const moneroAddressSchema = z
  .string()
  .trim()
  .regex(/^4[0-9A-Za-z]{94}$/)
  .or(z.literal(""));

export const pathSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_.~/-]+$/)
  .check(
    z.refine((val) => !val.includes(".."), "Path traversal not allowed"),
  )
  .or(z.literal(""));

export const hostListSchema = z.string().transform((val) =>
  val
    .split(/[\s,]+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0)
    .filter((e) => hostPortSchema.safeParse(e).success)
);

export const numericStringSchema = z
  .string()
  .trim()
  .regex(/^[0-9]+$/)
  .or(z.literal(""));

export const rpcLoginSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_!@#$%^&*()-]+$/)
  .or(z.literal(""));

/**
 * Safely parse a value against a Zod schema, returning a fallback on failure.
 * Used at the point of consumption (service generators) so the UI shows raw input
 * but generated Docker/bash output is always safe.
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  value: unknown,
  fallback: T
): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}
