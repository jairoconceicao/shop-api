import { z } from "zod";

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default("Shop API"),
  VITE_APP_ENV: z
    .enum(["local", "development", "staging", "production"])
    .default("local"),
  VITE_API_BASE_URL: z
    .string()
    .url()
    .default("http://localhost:5228/api/v1"),
});

const parsedEnv = envSchema.parse(import.meta.env);

export const env = {
  appName: parsedEnv.VITE_APP_NAME,
  appEnv: parsedEnv.VITE_APP_ENV,
  apiBaseUrl: parsedEnv.VITE_API_BASE_URL.replace(/\/+$/, ""),
} as const;
