import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { createCart } from './createCartService'

describe('createCart', () => {
  it('posts an authenticated request without a body and adapts the response', async () => {
    const client = {
      request: vi.fn().mockResolvedValue({
        status: true,
        data: { carrinhoId: '42', dataCarrinho: '2026-07-14T12:00:00Z' },
      }),
    }

    await expect(createCart('access-token', client)).resolves.toEqual({
      id: 42,
      createdAt: '2026-07-14T12:00:00Z',
    })
    expect(client.request).toHaveBeenCalledWith('/api/v1/carrinho/criar', {
      method: 'POST',
      token: 'access-token',
    })
    expect(client.request.mock.calls[0]?.[1]).not.toHaveProperty('body')
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: null }) }

    await expect(createCart('access-token', client)).rejects.toMatchObject({
      kind: 'contract',
    } satisfies Partial<AppError>)
  })

  it('preserves normalized HTTP errors', async () => {
    const error = new AppError({ kind: 'http', status: 409, message: 'Carrinho já existe.' })
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(createCart('access-token', client)).rejects.toBe(error)
  })
})
