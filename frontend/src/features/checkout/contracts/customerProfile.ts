import { z } from 'zod'

import { normalizeId } from '../../../shared/adapters/numbers'
import { createApiResponseSchema } from '../../../shared/contracts/apiEnvelopes'
import { normalizePostalCode } from '../../../shared/formatting/personalData'
import { deliveryAddressSchema, type DeliveryAddress } from './checkout'

const transportIdSchema = z.union([
  z.number().int(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

const customerAddressResponseSchema = z.object({
  logradouro: z.string(),
  numero: z.string(),
  complemento: z.string().nullable(),
  cep: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  uf: z.string(),
}).strict()

const customerPhoneResponseSchema = z.object({
  ddd: z.string(),
  numero: z.string(),
  whatsApp: z.boolean(),
}).strict()

const customerDetailResponseSchema = z.object({
  clienteId: transportIdSchema,
  cpf: z.string(),
  nome: z.string(),
  dataNascimento: z.iso.date(),
  email: z.string(),
  endereco: customerAddressResponseSchema,
  celular: customerPhoneResponseSchema,
}).strict()

export const checkoutProfileResponseSchema = createApiResponseSchema(
  customerDetailResponseSchema,
).strict()

export type CheckoutProfile = {
  customerId: number
  address: DeliveryAddress
}

export function adaptCheckoutProfileResponse(response: unknown): CheckoutProfile {
  const parsedResponse = checkoutProfileResponseSchema.parse(response)

  if (parsedResponse.status === false || !parsedResponse.data) {
    throw new TypeError('Customer detail response does not contain customer data')
  }

  const customerId = normalizeId(parsedResponse.data.clienteId)
  if (customerId <= 0) {
    throw new TypeError('Customer ID must be positive')
  }

  const address = parsedResponse.data.endereco

  return {
    customerId,
    address: deliveryAddressSchema.parse({
      logradouro: address.logradouro,
      numero: address.numero,
      complemento: address.complemento,
      cep: normalizePostalCode(address.cep),
      bairro: address.bairro,
      cidade: address.cidade,
      uf: address.uf.trim().toUpperCase(),
    }),
  }
}
