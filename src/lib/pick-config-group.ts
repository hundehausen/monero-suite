import type { z } from "zod/v4";

type ConfigGroup<T extends z.ZodRawShape> = z.infer<z.ZodObject<T>>;

export function pickConfigGroup<T extends z.ZodRawShape, S extends ConfigGroup<T>>(
  source: S,
  schema: z.ZodObject<T>
): ConfigGroup<T> {
  const result = {} as ConfigGroup<T>;
  for (const key of Object.keys(schema.shape) as (keyof ConfigGroup<T> & string)[]) {
    result[key] = source[key];
  }
  return result;
}
