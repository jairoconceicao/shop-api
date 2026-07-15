import { z } from 'zod'

import { normalizeId } from '../../../shared/adapters/numbers'
import { createApiResponseSchema } from '../../../shared/contracts/apiEnvelopes'
import type { AuthSession } from '../store/authStore'

const transportIdSchema = z.union([
  z.number().int(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

export const loginRequestSchema = z.object({
  email: z.email().trim(),
  senha: z.string().min(1),
})

export const loginResponseDataSchema = z.object({
  token: z.string().min(1),
  tipo: z.string().min(1),
  expiraEm: z.iso.datetime({offset: true}),
  usuarioId: transportIdSchema,
  clienteId: transportIdSchema,
  email: z.email(),
})

export const loginResponseSchema = createApiResponseSchema(
  loginResponseDataSchema,
)

export type LoginRequest = z.infer<typeof loginRequestSchema>

export function adaptLoginResponse(response: unknown): AuthSession {
  const parsedResponse = loginResponseSchema.parse(response)

  if (parsedResponse.status === false || !parsedResponse.data) {
    throw new TypeError('Login response does not contain session data')
  }

  const { usuarioId, clienteId, ...session } = parsedResponse.data

  return {
    ...session,
    usuarioId: normalizeId(usuarioId),
    clienteId: normalizeId(clienteId),
  }
}
