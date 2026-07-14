import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { registerCustomer } from './registrationService'

const request = {
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
  celular: { ddd: '11', numero: '912345678', whatsApp: true },
}

describe('registerCustomer', () => {
  it('posts the registration request and adapts the created customer', async () => {
    const client = {
      request: vi.fn().mockResolvedValue({
        status: true,
        data: { clienteId: '42' },
      }),
    }

    await expect(registerCustomer(request, client)).resolves.toEqual({ clienteId: 42 })
    expect(client.request).toHaveBeenCalledWith('/api/v1/cliente', {
      method: 'POST',
      body: request,
    })
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: null }) }

    await expect(registerCustomer(request, client)).rejects.toMatchObject({
      kind: 'contract',
    } satisfies Partial<AppError>)
  })

  it('preserves normalized HTTP errors', async () => {
    const error = new AppError({ kind: 'http', status: 409, message: 'CPF já cadastrado.' })
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(registerCustomer(request, client)).rejects.toBe(error)
  })
})
