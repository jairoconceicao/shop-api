import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { addCartItem } from './addCartItemService'

describe('addCartItem', () => {
  it('posts only the strict cart item contract and adapts the response', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: { itemId: '7' } }) }

    await expect(addCartItem('token', {
      produtoId: 42,
      quantidade: 2,
      valorUnitario: 349.9,
    }, client)).resolves.toEqual({ itemId: 7 })

    expect(client.request).toHaveBeenCalledWith('/api/v1/carrinho/items', {
      method: 'POST',
      token: 'token',
      body: { produtoId: 42, quantidade: 2, valorUnitario: 349.9 },
    })
  })

  it('rejects extra request properties before sending anything', async () => {
    const client = { request: vi.fn() }
    const request = { produtoId: 42, quantidade: 1, valorUnitario: 10, cartId: 9 }

    await expect(addCartItem('token', request, client)).rejects.toMatchObject({ kind: 'contract' })
    expect(client.request).not.toHaveBeenCalled()
  })

  it('maps invalid successful responses to contract errors', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: {} }) }

    await expect(addCartItem('token', {
      produtoId: 42, quantidade: 1, valorUnitario: 10,
    }, client)).rejects.toMatchObject({ kind: 'contract' })
  })

  it.each([
    new AppError({ kind: 'http', status: 409, code: 'PRICE_CONFLICT', message: 'Conflito.' }),
    new AppError({ kind: 'network', message: 'Sem conexão.' }),
  ])('preserves normalized transport errors', async (error) => {
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(addCartItem('token', {
      produtoId: 42, quantidade: 1, valorUnitario: 10,
    }, client)).rejects.toBe(error)
  })
})
