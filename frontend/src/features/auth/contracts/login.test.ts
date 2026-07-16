import { describe, expect, it } from 'vitest'

import {
  adaptLoginResponse,
  loginRequestSchema,
  loginResponseSchema,
} from './login'

const validData = {
  token: 'header.payload.signature',
  tipo: 'Bearer',
  expiraEm: '2026-07-13T18:00:00-03:00',
  usuarioId: 9999,
  clienteId: 8888,
  email: 'cliente@exemplo.com',
}

describe('loginRequestSchema', () => {
  it('rejects properties outside the request contract', () => {
    expect(() => loginRequestSchema.parse({ email: 'cliente@exemplo.com', senha: 'senha', extra: true })).toThrow()
  })
  it('validates the login request and normalizes surrounding email spaces', () => {
    expect(
      loginRequestSchema.parse({
        email: '  cliente@exemplo.com  ',
        senha: 'senha-secreta',
      }),
    ).toEqual({
      email: 'cliente@exemplo.com',
      senha: 'senha-secreta',
    })
  })

  it.each([
    { email: 'email-invalido', senha: 'senha-secreta' },
    { email: 'cliente@exemplo.com', senha: '' },
  ])('rejects invalid login input: $email', (request) => {
    expect(() => loginRequestSchema.parse(request)).toThrow()
  })
})

describe('loginResponseSchema', () => {
  it('rejects extra properties at every response level', () => {
    expect(() => loginResponseSchema.parse({ data: null, extra: true })).toThrow()
    expect(() => loginResponseSchema.parse({ data: { ...validData, extra: true } })).toThrow()
  })
  it('accepts the optional and nullable envelope described by OpenAPI', () => {
    expect(loginResponseSchema.parse({})).toEqual({})
    expect(loginResponseSchema.parse({ data: null })).toEqual({ data: null })
  })

  it('rejects an invalid login payload', () => {
    expect(() =>
      loginResponseSchema.parse({ data: { ...validData, token: '' } }),
    ).toThrow()
  })
})

describe('adaptLoginResponse', () => {
  it('normalizes transport IDs and returns a strict auth session', () => {
    expect(
      adaptLoginResponse({
        status: true,
        message: '',
        data: { ...validData, usuarioId: '9999', clienteId: '8888' },
      }),
    ).toEqual(validData)
  })

  it.each([
    {},
    { status: true, data: null },
    { status: false, data: validData },
  ])('rejects a response without successful session data', (response) => {
    expect(() => adaptLoginResponse(response)).toThrow(
      'Login response does not contain session data',
    )
  })

  it('rejects invalid transport data before adapting it', () => {
    expect(() =>
      adaptLoginResponse({ data: { ...validData, clienteId: '08' } }),
    ).toThrow()
  })
})
