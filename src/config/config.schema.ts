import z from 'zod';

export const ConfigSchema = z.object({
  APP_PORT: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0).max(65535)),
  BASE_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0).max(65535)),
  DB_USER: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export type ConfigSchema = Required<z.infer<typeof ConfigSchema>>;
