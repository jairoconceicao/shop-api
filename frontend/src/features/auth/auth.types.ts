import { z } from "zod";

export const authSessionSchema = z.object({
  token: z.string().min(1),
  tokenType: z.string().min(1),
  expiresAt: z.string().min(1),
  userId: z.number().int(),
  customerId: z.number().int().nullable(),
  email: z.string().email(),
  rememberSession: z.boolean(),
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export type LoginCredentials = {
  email: string;
  senha: string;
  rememberSession?: boolean;
};
