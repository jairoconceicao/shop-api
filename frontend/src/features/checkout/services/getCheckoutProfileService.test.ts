import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { getCheckoutProfile } from './getCheckoutProfileService'

const validResponse = {
  status: true,
  data: {
    clienteId: 42,
    cpf: '12345678901',
    nome: 'Maria',
    dataNascimento: '1990-05-20',
    email: 'maria@example.com',
    endereco: {
      logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345678',
      bairro: 'Centro', cidade: 'Sao Paulo', uf: 'SP',
    },
    celular: { ddd: '11', numero: '999999999', whatsApp: true },
  },
}

describe('getCheckoutProfile', () => {
  it('gets the authenticated customer detail and forwards cancellation', async () => {
    const signal = new AbortController().signal
    const client = { request: vi.fn().mockResolvedValue(validResponse) }

    await expect(getCheckoutProfile(42, 'access-token', signal, client)).resolves.toEqual({
      customerId: 42,
      address: validResponse.data.endereco,
    })
    expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/42', {
      token: 'access-token',
      signal,
    })
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: {} }) }

    await expect(getCheckoutProfile(42, 'token', undefined, client)).rejects.toMatchObject({
      kind: 'contract',
    })
  })

  it('preserves normalized transport errors', async () => {
    const error = new AppError({ kind: 'network', message: 'Sem conexao.' })
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(getCheckoutProfile(42, 'token', undefined, client)).rejects.toBe(error)
  })
})
