import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  adaptCustomerIdResponse,
  adaptCustomerProfileResponse,
  adaptUpdateCustomerRequest,
  toCheckoutProfile,
  type CustomerProfileFormValues,
} from './customerProfile'

const profileData = {
  clienteId: '7',
  cpf: '12345678901',
  nome: 'Ana',
  dataNascimento: '1990-01-02',
  email: 'ana@example.com',
  endereco: {
    logradouro: 'Rua A',
    numero: '10',
    complemento: null,
    cep: '12345-678',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
  },
  celular: { ddd: '11', numero: '999999999', whatsApp: true },
}

const formValues: CustomerProfileFormValues = {
  cpf: '123.456.789-01',
  nome: '  Ana  ',
  dataNascimento: '1990-01-02',
  email: '  ana@example.com  ',
  logradouro: '  Rua A  ',
  numero: '  10  ',
  complemento: '   ',
  cep: ' 12345-678 ',
  bairro: '  Centro  ',
  cidade: '  São Paulo  ',
  uf: ' sp ',
  ddd: '11',
  celularNumero: ' 999999999 ',
  whatsApp: true,
}

function okEnvelope(data: unknown) {
  return { status: true, message: 'OK', data }
}

describe('customer profile contract', () => {
  afterEach(() => vi.useRealTimers())

  it('rejects tomorrow in local civil time across the UTC date rollover', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 15, 23, 30))
    const tomorrow = { ...profileData, dataNascimento: '2026-07-16' }

    expect(() => adaptCustomerProfileResponse(okEnvelope(tomorrow))).toThrow()
    expect(() => adaptUpdateCustomerRequest({ ...formValues, dataNascimento: '2026-07-16' })).toThrow()
  })

  it('adapts a strict complete profile and normalizes its positive ID', () => {
    expect(adaptCustomerProfileResponse(okEnvelope(profileData))).toEqual({
      customerId: 7,
      cpf: '12345678901',
      nome: 'Ana',
      dataNascimento: '1990-01-02',
      email: 'ana@example.com',
      endereco: profileData.endereco,
      celular: profileData.celular,
    })
  })

  it.each([
    { status: true, message: '', data: null },
    { status: false, message: 'Falha', data: profileData },
    okEnvelope({ ...profileData, clienteId: 0 }),
    okEnvelope({ ...profileData, clienteId: '1.5' }),
    okEnvelope({ ...profileData, dataNascimento: '2999-01-01' }),
    okEnvelope({ ...profileData, unexpected: true }),
    { ...okEnvelope(profileData), unexpected: true },
  ])('rejects an invalid profile response %#', (response) => {
    expect(() => adaptCustomerProfileResponse(response)).toThrow()
  })

  it('creates a strict normalized update request without an ID or password', () => {
    expect(adaptUpdateCustomerRequest(formValues)).toEqual({
      cpf: '12345678901',
      nome: 'Ana',
      dataNascimento: '1990-01-02',
      email: 'ana@example.com',
      endereco: {
        logradouro: 'Rua A',
        numero: '10',
        complemento: null,
        cep: '12345-678',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
      },
      celular: { ddd: '11', numero: '999999999', whatsApp: true },
    })
  })

  it.each([
    { ...formValues, customerId: 7 },
    { ...formValues, senha: 'segredo' },
    { ...formValues, cpf: '123' },
    { ...formValues, ddd: '1' },
    { ...formValues, dataNascimento: '2999-01-01' },
    { ...formValues, nome: 'a'.repeat(201) },
  ])('rejects invalid or extra update form values %#', (values) => {
    expect(() => adaptUpdateCustomerRequest(values)).toThrow()
  })

  it('accepts only a positive matching customer ID response', () => {
    expect(adaptCustomerIdResponse(okEnvelope({ clienteId: '7' }), 7)).toEqual({
      customerId: 7,
    })

    expect(() => adaptCustomerIdResponse(okEnvelope({ clienteId: '8' }), 7)).toThrow()
    expect(() => adaptCustomerIdResponse(okEnvelope({ clienteId: 0 }), 7)).toThrow()
    expect(() => adaptCustomerIdResponse(okEnvelope({ clienteId: '7', extra: true }), 7)).toThrow()
  })

  it('projects only the checkout fields and normalizes CEP to eight digits', () => {
    const profile = adaptCustomerProfileResponse(okEnvelope(profileData))

    expect(toCheckoutProfile(profile)).toEqual({
      customerId: 7,
      address: {
        logradouro: 'Rua A',
        numero: '10',
        complemento: null,
        cep: '12345678',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
      },
    })
  })

  it('rejects a checkout projection when the normalized CEP has fewer than eight digits', () => {
    const profile = adaptCustomerProfileResponse(okEnvelope({
      ...profileData,
      endereco: { ...profileData.endereco, cep: '123' },
    }))

    expect(() => toCheckoutProfile(profile)).toThrow()
  })
})
