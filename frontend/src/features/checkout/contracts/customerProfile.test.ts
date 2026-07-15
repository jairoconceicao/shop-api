import { describe, expect, it } from 'vitest'

import { adaptCheckoutProfileResponse } from './customerProfile'

const response = {
  status: true,
  message: 'Cliente encontrado.',
  data: {
    clienteId: '42',
    cpf: '12345678901',
    nome: '  Maria da Silva  ',
    dataNascimento: '1990-05-20',
    email: 'maria@example.com',
    endereco: {
      logradouro: '  Rua das Flores  ',
      numero: '  123  ',
      complemento: '  Apto 4  ',
      cep: '12345-678',
      bairro: '  Centro  ',
      cidade: '  Sao Paulo  ',
      uf: 'sp',
    },
    celular: { ddd: '11', numero: '999999999', whatsApp: true },
  },
}

describe('adaptCheckoutProfileResponse', () => {
  it('adapts the customer envelope to checkout-only normalized values', () => {
    expect(adaptCheckoutProfileResponse(response)).toEqual({
      customerId: 42,
      address: {
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Apto 4',
        cep: '12345678',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
    })
  })

  it('preserves a null complement', () => {
    const nullComplement = structuredClone(response)
    nullComplement.data.endereco.complemento = null as unknown as string

    expect(adaptCheckoutProfileResponse(nullComplement).address.complemento).toBeNull()
  })

  it.each([
    { ...response, status: false },
    { ...response, data: null },
    { ...response, unexpected: true },
    { ...response, data: { ...response.data, unexpected: true } },
    {
      ...response,
      data: { ...response.data, endereco: { ...response.data.endereco, referencia: 'Praca' } },
    },
    {
      ...response,
      data: { ...response.data, endereco: { ...response.data.endereco, cep: '123' } },
    },
  ])('rejects an invalid or unsuccessful customer response %#', (invalidResponse) => {
    expect(() => adaptCheckoutProfileResponse(invalidResponse)).toThrow()
  })
})
