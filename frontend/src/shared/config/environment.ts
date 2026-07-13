import { z } from 'zod'

export const environmentSchema = z.object({
  MODE: z.enum(['development', 'test', 'production']),
  VITE_API_BASE_URL: z
    .string()
    .url()
    .refine((url) => ['http:', 'https:'].includes(new URL(url).protocol), {
      message: 'VITE_API_BASE_URL must use HTTP or HTTPS',
    }),
})

export type AppEnvironment = z.infer<typeof environmentSchema>

export function parseEnvironment(environment: unknown): AppEnvironment {
  return environmentSchema.parse(environment)
}
