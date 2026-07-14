import { describe, expect, it } from 'vitest'

import {
  adaptCreateCustomerRequest,
  adaptCreateCustomerResponse,
  createCustomerRequestSchema,
  createCustomerResponseSchema,
} from './registration'

const validRequest = {
  senha: 'Senha@123',
  cpf: '12345678901',
  nome: 'Cliente Exemplo',
  dataNascimento: '1990-05-20',
  email: 'cliente@exemplo.com',
  endereco: {
    logradouro: 'Rua Um',
    numero: '123',
    complemento: null,
    cep: '12345678',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
  },
  celular: {
    ddd: '11',
    numero: '912345678',
    whatsApp: true,
  },
}

describe('createCustomerRequestSchema', () => {
  it('validates all fields from CreateClienteRequest', () => {
    expect(createCustomerRequestSchema.parse(validRequest)).toEqual(validRequest)
  })

  it.each([
    { field: 'cpf', value: '123.456.789-01' },
    { field: 'dataNascimento', value: '20/05/1990' },
    { field: 'senha', value: 'curta' },
  ])('rejects an invalid $field', ({ field, value }) => {
    expect(() =>
      createCustomerRequestSchema.parse({ ...validRequest, [field]: value }),
    ).toThrow()
  })

  it('requires the nested address and phone contracts', () => {
    expect(() =>
      createCustomerRequestSchema.parse({ ...validRequest, endereco: undefined }),
    ).toThrow()
    expect(() =>
      createCustomerRequestSchema.parse({ ...validRequest, celular: undefined }),
    ).toThrow()
  })
})

describe('adaptCreateCustomerRequest', () => {
  it('trims textual transport fields without implementing presentation masks', () => {
    expect(
      adaptCreateCustomerRequest({
        ...validRequest,
        nome: '  Cliente Exemplo  ',
        email: '  cliente@exemplo.com  ',
        endereco: {
          ...validRequest.endereco,
          logradouro: '  Rua Um  ',
        },
      }),
    ).toEqual(validRequest)
  })
})

describe('createCustomerResponseSchema', () => {
  it('accepts the optional and nullable envelope described by OpenAPI', () => {
    expect(createCustomerResponseSchema.parse({})).toEqual({})
    expect(createCustomerResponseSchema.parse({ data: null })).toEqual({ data: null })
  })

  it('rejects an invalid customer ID transport value', () => {
    expect(() =>
      createCustomerResponseSchema.parse({ data: { clienteId: '08' } }),
    ).toThrow()
  })
})

describe('adaptCreateCustomerResponse', () => {
  it('normalizes the returned customer ID', () => {
    expect(
      adaptCreateCustomerResponse({
        status: true,
        message: 'Cliente criado.',
        data: { clienteId: '8888' },
      }),
    ).toEqual({ clienteId: 8888 })
  })

  it.each([
    {},
    { status: true, data: null },
    { status: false, data: { clienteId: 8888 } },
  ])('rejects a response without successful customer data', (response) => {
    expect(() => adaptCreateCustomerResponse(response)).toThrow(
      'Customer creation response does not contain customer data',
    )
  })
})
