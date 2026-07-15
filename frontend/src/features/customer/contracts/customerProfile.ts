import { z } from 'zod'

import { normalizeId } from '../../../shared/adapters/numbers'
import { createApiResponseSchema } from '../../../shared/contracts/apiEnvelopes'
import {
  normalizeCpf,
  normalizePostalCode,
} from '../../../shared/formatting/personalData'

const transportIdSchema = z.union([
  z.number().int(),
  z.string().regex(/^-?(?:0|[1-9]\d*)$/),
])

const notFutureDateSchema = z.iso.date().refine(
  (value) => value <= new Date().toISOString().slice(0, 10),
  { message: 'Date cannot be in the future' },
)

const customerAddressSchema = z.object({
  logradouro: z.string().trim().min(1).max(200),
  numero: z.string().trim().min(1).max(50),
  complemento: z.string().trim().max(200).nullable(),
  cep: z.string().trim().min(1).max(20),
  bairro: z.string().trim().min(1).max(100),
  cidade: z.string().trim().min(1).max(100),
  uf: z.string().trim().length(2).transform((value) => value.toUpperCase()),
}).strict()

const customerPhoneSchema = z.object({
  ddd: z.string().regex(/^\d{2}$/),
  numero: z.string().trim().min(1).max(30),
  whatsApp: z.boolean(),
}).strict()

const customerDetailSchema = z.object({
  clienteId: transportIdSchema,
  cpf: z.string().regex(/^\d{11}$/),
  nome: z.string().trim().min(1).max(200),
  dataNascimento: notFutureDateSchema,
  email: z.string().trim().email().max(200),
  endereco: customerAddressSchema,
  celular: customerPhoneSchema,
}).strict()

const customerIdSchema = z.object({ clienteId: transportIdSchema }).strict()

const customerProfileResponseSchema = createApiResponseSchema(customerDetailSchema).strict()
const customerIdResponseSchema = createApiResponseSchema(customerIdSchema).strict()

const customerProfileFormSchema = z.object({
  cpf: z.string(),
  nome: z.string(),
  dataNascimento: notFutureDateSchema,
  email: z.string(),
  logradouro: z.string(),
  numero: z.string(),
  complemento: z.string(),
  cep: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  uf: z.string(),
  ddd: z.string(),
  celularNumero: z.string(),
  whatsApp: z.boolean(),
}).strict()

const updateCustomerRequestSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/),
  nome: z.string().trim().min(1).max(200),
  dataNascimento: notFutureDateSchema,
  email: z.string().trim().email().max(200),
  endereco: customerAddressSchema,
  celular: customerPhoneSchema,
}).strict()

export type CustomerProfile = {
  customerId: number
  cpf: string
  nome: string
  dataNascimento: string
  email: string
  endereco: {
    logradouro: string
    numero: string
    complemento: string | null
    cep: string
    bairro: string
    cidade: string
    uf: string
  }
  celular: { ddd: string; numero: string; whatsApp: boolean }
}

export type CustomerProfileFormValues = Omit<
  CustomerProfile,
  'customerId' | 'endereco' | 'celular'
> & {
  logradouro: string
  numero: string
  complemento: string
  cep: string
  bairro: string
  cidade: string
  uf: string
  ddd: string
  celularNumero: string
  whatsApp: boolean
}

export type UpdateCustomerRequest = Omit<CustomerProfile, 'customerId'>

export type CheckoutProfile = {
  customerId: number
  address: CustomerProfile['endereco']
}

function positiveCustomerId(value: number | string): number {
  const customerId = normalizeId(value)
  if (customerId <= 0) throw new TypeError('Customer ID must be positive')
  return customerId
}

export function adaptCustomerProfileResponse(response: unknown): CustomerProfile {
  const parsed = customerProfileResponseSchema.parse(response)
  if (parsed.status === false || !parsed.data) {
    throw new TypeError('Customer detail response does not contain customer data')
  }

  return {
    customerId: positiveCustomerId(parsed.data.clienteId),
    cpf: parsed.data.cpf,
    nome: parsed.data.nome,
    dataNascimento: parsed.data.dataNascimento,
    email: parsed.data.email,
    endereco: parsed.data.endereco,
    celular: parsed.data.celular,
  }
}

export function adaptUpdateCustomerRequest(
  values: CustomerProfileFormValues,
): UpdateCustomerRequest {
  const parsed = customerProfileFormSchema.parse(values)

  return updateCustomerRequestSchema.parse({
    cpf: normalizeCpf(parsed.cpf),
    nome: parsed.nome.trim(),
    dataNascimento: parsed.dataNascimento,
    email: parsed.email.trim(),
    endereco: {
      logradouro: parsed.logradouro.trim(),
      numero: parsed.numero.trim(),
      complemento: parsed.complemento.trim() || null,
      cep: parsed.cep.trim(),
      bairro: parsed.bairro.trim(),
      cidade: parsed.cidade.trim(),
      uf: parsed.uf.trim().toUpperCase(),
    },
    celular: {
      ddd: parsed.ddd.trim(),
      numero: parsed.celularNumero.trim(),
      whatsApp: parsed.whatsApp,
    },
  })
}

export function adaptCustomerIdResponse(
  response: unknown,
  expectedCustomerId: number,
): { customerId: number } {
  const parsed = customerIdResponseSchema.parse(response)
  if (parsed.status === false || !parsed.data) {
    throw new TypeError('Customer response does not contain an ID')
  }

  const customerId = positiveCustomerId(parsed.data.clienteId)
  if (customerId !== positiveCustomerId(expectedCustomerId)) {
    throw new TypeError('Customer response ID does not match the requested customer')
  }

  return { customerId }
}

export function toCheckoutProfile(profile: CustomerProfile): CheckoutProfile {
  const parsed = customerDetailSchema.parse({
    clienteId: profile.customerId,
    cpf: profile.cpf,
    nome: profile.nome,
    dataNascimento: profile.dataNascimento,
    email: profile.email,
    endereco: profile.endereco,
    celular: profile.celular,
  })

  return {
    customerId: positiveCustomerId(parsed.clienteId),
    address: {
      ...parsed.endereco,
      cep: normalizePostalCode(parsed.endereco.cep),
    },
  }
}
