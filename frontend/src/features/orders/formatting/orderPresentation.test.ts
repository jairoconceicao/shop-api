import { describe, expect, it } from 'vitest'

import type { OrderStatus } from '../contracts/orders'
import { calculateOrderTotal, getOrderStatusLabel } from './orderPresentation'

describe('order presentation', () => {
  it.each<[OrderStatus, string]>([
    ['Criado', 'Criado'],
    ['EmProcessamento', 'Em processamento'],
    ['Processado', 'Processado'],
    ['Cancelado', 'Cancelado'],
    ['Devolvido', 'Devolvido'],
  ])('maps %s to its friendly label', (status, label) => {
    expect(getOrderStatusLabel(status)).toBe(label)
  })

  it('derives the total from confirmed quantities and unit prices', () => {
    expect(calculateOrderTotal([
      { itemId: 1, productId: 2, quantity: 2, unitPrice: 10.5 },
      { itemId: 2, productId: 3, quantity: 1, unitPrice: 4 },
    ])).toBe(25)
  })

  it('returns zero when the order has no items', () => {
    expect(calculateOrderTotal([])).toBe(0)
  })
})
