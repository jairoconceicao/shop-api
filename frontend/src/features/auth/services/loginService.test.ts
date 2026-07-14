import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { login } from './loginService'

const request = {
  email: '  cliente@exemplo.com  ',
  senha: 'senha-secreta',
}

const response = {
  status: true,
  message: 'Login realizado.',
  data: {
    token: 'header.payload.signature',
    tipo: 'Bearer',
    expiraEm: '2026-07-14T18:00:00-03:00',
    usuarioId: '9999',
    clienteId: '8888',
    email: 'cliente@exemplo.com',
  },
}

describe('login', () => {
  it('posts normalized credentials and adapts the session', async () => {
    const client = {
      request: vi.fn().mockResolvedValue(response),
    }

    await expect(login(request, client)).resolves.toEqual({
      ...response.data,
      usuarioId: 9999,
      clienteId: 8888,
    })
    expect(client.request).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'cliente@exemplo.com',
        senha: 'senha-secreta',
      },
    })
  })

  it('maps invalid successful responses to an application contract error', async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ status: true, data: null }),
    }

    await expect(login(request, client)).rejects.toMatchObject({
      kind: 'contract',
    } satisfies Partial<AppError>)
  })

  it('preserves errors already normalized by the API client', async () => {
    const error = new AppError({
      kind: 'http',
      status: 401,
      message: 'Credenciais inválidas.',
    })
    const client = {
      request: vi.fn().mockRejectedValue(error),
    }

    await expect(login(request, client)).rejects.toBe(error)
  })
})
