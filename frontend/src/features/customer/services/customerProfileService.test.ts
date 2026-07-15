import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { getCustomerProfile, updateCustomerPassword, updateCustomerProfile } from './customerProfileService'

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

describe('getCustomerProfile', () => {
  it('gets the authenticated customer detail and forwards cancellation', async () => {
    const signal = new AbortController().signal
    const client = { request: vi.fn().mockResolvedValue(validResponse) }

    await expect(getCustomerProfile(42, 'access-token', signal, client)).resolves.toMatchObject({
      customerId: 42,
      nome: 'Maria',
      endereco: validResponse.data.endereco,
    })
    expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/42', {
      token: 'access-token', signal,
    })
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: {} }) }
    await expect(getCustomerProfile(42, 'token', undefined, client)).rejects.toMatchObject({ kind: 'contract' })
  })

  it('preserves normalized transport errors', async () => {
    const error = new AppError({ kind: 'network', message: 'Sem conexao.' })
    const client = { request: vi.fn().mockRejectedValue(error) }
    await expect(getCustomerProfile(42, 'token', undefined, client)).rejects.toBe(error)
  })
})

describe('updateCustomerPassword', () => {
  it('sends the exact password request by authenticated PUT and adapts a matching ID', async () => {
    const request = { senhaAtual: 'Atual#123', senhaNova: 'Nova#456A' }
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: { clienteId: '42' } }) }

    await expect(updateCustomerPassword({ customerId: 42, token: 'secret-token', request }, client))
      .resolves.toEqual({ customerId: 42 })
    expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/42/senha', {
      method: 'PUT', token: 'secret-token', body: request,
    })
  })

  it('maps a divergent response ID to a contract error', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: { clienteId: 9 } }) }
    await expect(updateCustomerPassword({
      customerId: 42, token: 'token', request: { senhaAtual: 'Atual#123', senhaNova: 'Nova#456A' },
    }, client)).rejects.toMatchObject({ kind: 'contract' })
  })
})

describe('updateCustomerProfile', () => {
  const request = {
    cpf: '12345678901', nome: 'Ana', dataNascimento: '1990-01-02', email: 'ana@example.com',
    endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' },
    celular: { ddd: '11', numero: '999999999', whatsApp: true },
  }

  it('sends the complete request by PUT and accepts only the matching customer ID', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: { clienteId: '42' } }) }
    await expect(updateCustomerProfile({ customerId: 42, token: 'token', request }, client)).resolves.toEqual({ customerId: 42 })
    expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/42', { method: 'PUT', token: 'token', body: request })
  })

  it('maps malformed and divergent successful responses to contract errors', async () => {
    for (const response of [{ status: true, data: { clienteId: 9 } }, { status: true, data: null }]) {
      const client = { request: vi.fn().mockResolvedValue(response) }
      await expect(updateCustomerProfile({ customerId: 42, token: 'token', request }, client)).rejects.toMatchObject({ kind: 'contract' })
    }
  })
})
