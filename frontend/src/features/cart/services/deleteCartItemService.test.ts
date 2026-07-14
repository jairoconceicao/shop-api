import { describe, expect, it, vi } from 'vitest'

import { deleteCartItem } from './deleteCartItemService'

describe('deleteCartItem', () => {
  it('deletes the exact item URL without a request body', async () => {
    const client = { request: vi.fn().mockResolvedValue({
      status: true, data: { itemId: '7', produtoId: '42' },
    }) }

    await expect(deleteCartItem(7, 'token', client))
      .resolves.toEqual({ itemId: 7, productId: 42 })
    expect(client.request).toHaveBeenCalledWith('/api/v1/carrinho/items/7', {
      method: 'DELETE', token: 'token',
    })
  })
})
