import { z } from 'zod'

import { normalizeId } from '../../../shared/adapters/numbers'
import { createApiResponseSchema } from '../../../shared/contracts/apiEnvelopes'

const transportIdSchema = z.union([
  z.number().int(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

export const addressRequestSchema = z.object({
  logradouro: z.string().trim().min(1).max(200),
  numero: z.string().trim().min(1).max(50),
  complemento: z.string().trim().max(200).nullable(),
  cep: z.string().trim().min(1).max(20),
  bairro: z.string().trim().min(1).max(100),
  cidade: z.string().trim().min(1).max(100),
  uf: z.string().trim().length(2),
})

export const phoneRequestSchema = z.object({
  ddd: z.string().regex(/^\d{2}$/),
  numero: z.string().trim().min(1).max(30),
  whatsApp: z.boolean(),
})

export const createCustomerRequestSchema = z.object({
  senha: z.string().min(8).max(200),
  cpf: z.string().regex(/^\d{11}$/),
  nome: z.string().trim().min(1).max(200),
  dataNascimento: z.iso.date(),
  email: z.string().trim().email().max(200),
  endereco: addressRequestSchema,
  celular: phoneRequestSchema,
})

export const createCustomerResponseDataSchema = z.object({
  clienteId: transportIdSchema,
})

export const createCustomerResponseSchema = createApiResponseSchema(
  createCustomerResponseDataSchema,
)

export type CreateCustomerRequest = z.infer<typeof createCustomerRequestSchema>

export type CreatedCustomer = {
  clienteId: number
}

export function adaptCreateCustomerRequest(request: unknown): CreateCustomerRequest {
  return createCustomerRequestSchema.parse(request)
}

export function adaptCreateCustomerResponse(response: unknown): CreatedCustomer {
  const parsedResponse = createCustomerResponseSchema.parse(response)

  if (parsedResponse.status === false || !parsedResponse.data) {
    throw new TypeError('Customer creation response does not contain customer data')
  }

  return {
    clienteId: normalizeId(parsedResponse.data.clienteId),
  }
}
