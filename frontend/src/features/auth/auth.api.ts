import { z } from "zod";
import { requestJson } from "@/shared/api/http";
import type { AuthSession, LoginCredentials } from "@/features/auth/auth.types";

const loginResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z.object({
    token: z.string().min(1),
    tipo: z.string().min(1),
    expiraEm: z.string().min(1),
    usuarioId: z.number().int(),
    clienteId: z.number().int().nullable(),
    email: z.string().email(),
  }),
});

const logoutResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z.object({
    jti: z.string(),
    revogadaEm: z.string(),
  }),
});

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = loginResponseSchema.parse(
    await requestJson<unknown>("/auth/login", {
      method: "POST",
      body: {
        email: credentials.email,
        senha: credentials.senha,
      },
    }),
  );

  return {
    token: response.data.token,
    tokenType: response.data.tipo,
    expiresAt: response.data.expiraEm,
    userId: response.data.usuarioId,
    customerId: response.data.clienteId,
    email: response.data.email,
    rememberSession: credentials.rememberSession ?? true,
  };
}

export async function logout(token: string) {
  const response = logoutResponseSchema.parse(
    await requestJson<unknown>("/auth/logout", {
      method: "POST",
      token,
    }),
  );

  return response.data;
}
