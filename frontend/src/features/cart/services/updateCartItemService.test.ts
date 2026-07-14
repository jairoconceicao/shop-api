import { describe, expect, it, vi } from 'vitest'

import { updateCartItem } from './updateCartItemService'

describe('updateCartItem', () => {
  it('patches the exact item URL with only the strict quantity body', async () => {
    const client = { request: vi.fn().mockResolvedValue({
      status: true, data: { itemId: '7', produtoId: '42' },
    }) }

    await expect(updateCartItem(7, 'token', { quantidade: 3 }, client))
      .resolves.toEqual({ itemId: 7, productId: 42 })
    expect(client.request).toHaveBeenCalledWith('/api/v1/carrinho/items/7', {
      method: 'PATCH', token: 'token', body: { quantidade: 3 },
    })
  })

  it('rejects extra body properties before making a request', async () => {
    const client = { request: vi.fn() }
    await expect(updateCartItem(7, 'token', { quantidade: 3, produtoId: 42 }, client))
      .rejects.toMatchObject({ kind: 'contract' })
    expect(client.request).not.toHaveBeenCalled()
  })
})
