import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { getCart } from './getCartService'

describe('getCart', () => {
  it('gets the authenticated cart and adapts its complete contract', async () => {
    const signal = new AbortController().signal
    const client = { request: vi.fn().mockResolvedValue({
      status: true,
      data: {
        clienteId: '12',
        carrinhoId: '900',
        dataCarrinho: '2026-07-14T12:30:00Z',
        items: [{ itemId: '7', produtoId: '42', quantidade: '2', valorUnitario: '349.90' }],
      },
    }) }

    await expect(getCart(900, 'access-token', signal, client)).resolves.toEqual({
      customerId: 12,
      id: 900,
      createdAt: '2026-07-14T12:30:00Z',
      items: [{ id: 7, productId: 42, quantity: 2, unitPrice: 349.9 }],
    })
    expect(client.request).toHaveBeenCalledWith('/api/v1/carrinho/900', {
      token: 'access-token',
      signal,
    })
  })

  it('maps invalid successful responses to contract errors', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: {} }) }

    await expect(getCart(900, 'token', undefined, client)).rejects.toMatchObject({
      kind: 'contract',
    })
  })

  it.each([
    new AppError({ kind: 'http', status: 404, message: 'Não encontrado.' }),
    new AppError({ kind: 'network', message: 'Sem conexão.' }),
  ])('preserves normalized transport errors', async (error) => {
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(getCart(900, 'token', undefined, client)).rejects.toBe(error)
  })
})
