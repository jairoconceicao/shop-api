import { describe, expect, it } from 'vitest'

import {
  checkoutFormSchema,
  deliveryAddressSchema,
  paymentMethodSchema,
} from './checkout'

const validAddress = {
  logradouro: 'Rua das Flores',
  numero: '123',
  complemento: null,
  cep: '12345678',
  bairro: 'Centro',
  cidade: 'São Paulo',
  uf: 'SP',
}

describe('paymentMethodSchema', () => {
  it.each(['Pix', 'Cartao', 'Boleto'] as const)('accepts %s', (paymentMethod) => {
    expect(paymentMethodSchema.parse(paymentMethod)).toBe(paymentMethod)
  })

  it('rejects payment methods outside the contract', () => {
    expect(() => paymentMethodSchema.parse('Credito')).toThrow()
  })
})

describe('deliveryAddressSchema', () => {
  it('accepts a complete delivery address', () => {
    expect(deliveryAddressSchema.parse(validAddress)).toEqual(validAddress)
  })

  it.each([undefined, null, 'Apto 12'])(
    'accepts optional or nullable complemento: %s',
    (complemento) => {
      const address = { ...validAddress, complemento }

      if (complemento === undefined) delete address.complemento

      expect(deliveryAddressSchema.parse(address)).toEqual(address)
    },
  )

  it.each([
    ['logradouro', ''],
    ['numero', '   '],
    ['bairro', ''],
    ['cidade', ''],
    ['cep', '12345-678'],
    ['uf', 'S'],
    ['uf', 'sp'],
  ])('rejects invalid %s', (field, value) => {
    expect(() =>
      deliveryAddressSchema.parse({ ...validAddress, [field]: value }),
    ).toThrow()
  })

  it('rejects unknown address properties', () => {
    expect(() =>
      deliveryAddressSchema.parse({ ...validAddress, referencia: 'Próximo à praça' }),
    ).toThrow()
  })
})

describe('checkoutFormSchema', () => {
  it('accepts address and payment method form values', () => {
    const values = { enderecoEntrega: validAddress, formaPagamento: 'Pix' }

    expect(checkoutFormSchema.parse(values)).toEqual(values)
  })

  it('rejects unknown form properties', () => {
    expect(() =>
      checkoutFormSchema.parse({
        enderecoEntrega: validAddress,
        formaPagamento: 'Pix',
        clienteId: 42,
      }),
    ).toThrow()
  })
})
