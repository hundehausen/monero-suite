import { z } from "zod/v4";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const validPort = (portStr: string) => {
  const n = parseInt(portStr, 10);
  return !isNaN(n) && n >= 0 && n <= 65535;
};

export const domainSchema = z
  .string()
  .trim()
  .max(253)
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(:\d{1,5})?$/)
  .check(
    z.refine((val) => {
      if (val.includes(":")) {
        const port = parseInt(val.split(":").pop()!, 10);
        return port >= 0 && port <= 65535;
      }
      return true;
    }, "Port out of range 0-65535"),
  )
  .or(z.literal(""));

export const hostPortSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9._-]+$/)
  .check(z.refine((val) => !val.includes(":") || validPort(val.split(":").pop()!), "Port out of range 0-65535"))
  .or(
    z.string()
      .regex(/^[a-z2-7]{56}\.onion$/)
      .check(z.refine((val) => !val.includes(":") || validPort(val.split(":").pop()!), "Port out of range 0-65535"))
  )
  .or(z.literal(""));

export const commandValueSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_.:/=@+\-[\]{}(),#%~^*!?\s]+$/, "Contains disallowed characters")
  .check(
    z.refine((val) => !/[\r\n\t\x00]/.test(val), "Contains control characters"),
    z.refine((val) => !/[;&|`$\\]/.test(val), "Contains shell metacharacters"),
  )
  .or(z.literal(""));

export const moneroAddressSchema = z
  .string()
  .trim()
  .regex(new RegExp(`^[48][${BASE58}]{94}$`))
  .or(z.literal(""));

export const pathSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_./~-]+$/)
  .check(
    z.refine((val) => !val.includes(".."), "Path traversal not allowed"),
  )
  .or(z.literal(""));

export const hostListSchema = z
  .string()
  .transform((val) =>
    val
      .split(/[\s,]+/)
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0)
  )
  .check(
    z.superRefine((entries: string[], ctx) => {
      const invalid = entries.filter((e) => !hostPortSchema.safeParse(e).success);
      if (invalid.length > 0) {
        ctx.addIssue(`Invalid host entries: ${invalid.join(", ")}`);
      }
    })
  );

export const portSchema = z
  .string()
  .trim()
  .regex(/^[0-9]+$/)
  .check(z.refine((val) => validPort(val), "Port out of range 0-65535"))
  .or(z.literal(""));

export const numericStringSchema = z
  .string()
  .trim()
  .regex(/^[0-9]+$/)
  .or(z.literal(""));

export const signedNumericStringSchema = z
  .string()
  .trim()
  .regex(/^-?[0-9]+$/)
  .or(z.literal(""));

export const rpcLoginSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_!@#$%^&*()-]+$/)
  .or(z.literal(""));

export const rpcSslSchema = z.enum(["autodetect", "enabled", "disabled"]);

export function safeParse<T>(
  schema: z.ZodType<T>,
  value: unknown,
  fallback: T
): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}
