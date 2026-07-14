import { describe, expect, it } from 'vitest'

import type { Cart } from '../../cart/contracts/cart'
import { buildOrderItems } from './confirmedCartItems'

const hydratedItem = {
  id: 7,
  productId: 42,
  quantity: 2,
  unitPrice: 19.9,
  product: { name: 'Produto hidratado' },
  subtotal: 39.8,
}

const confirmedCart: Cart = {
  customerId: 20,
  id: 900,
  createdAt: '2026-07-14T12:00:00Z',
  items: [hydratedItem],
}

describe('buildOrderItems', () => {
  it('maps only the exact order fields from confirmed cart items', () => {
    expect(buildOrderItems(confirmedCart)).toEqual([
      { itemId: 7, produtoId: 42, quantidade: 2, valorUnitario: 19.9 },
    ])
  })

  it.each([undefined, null])('rejects an absent confirmed cart (%s)', (cart) => {
    expect(() => buildOrderItems(cart)).toThrow(TypeError)
  })

  it('rejects an empty confirmed cart', () => {
    expect(() => buildOrderItems({ ...confirmedCart, items: [] })).toThrow(TypeError)
  })
})
