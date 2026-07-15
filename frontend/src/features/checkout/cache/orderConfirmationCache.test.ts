import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { clearPrivateCache } from '../../../shared/query/privateCache'
import {
  getOrderConfirmation,
  orderConfirmationKey,
  setOrderConfirmation,
} from './orderConfirmationCache'

const createdOrder = {
  id: 99,
  customerId: 7,
  createdAt: '2026-07-14T14:00:00Z',
  paymentMethod: 'Pix' as const,
  status: 'Criado' as const,
  total: 100,
}

describe('orderConfirmationCache', () => {
  it('keeps a created order only in a private in-memory query', () => {
    const client = new QueryClient()

    setOrderConfirmation(client, createdOrder)

    expect(getOrderConfirmation(client, 99)).toEqual(createdOrder)
    expect(client.getQueryCache().find({ queryKey: orderConfirmationKey(99), exact: true })?.meta)
      .toMatchObject({ private: true })
    clearPrivateCache(client)
    expect(getOrderConfirmation(client, 99)).toBeUndefined()
  })

  it('does not return a snapshot for a different route id', () => {
    const client = new QueryClient()
    setOrderConfirmation(client, createdOrder)

    expect(getOrderConfirmation(client, 100)).toBeUndefined()
  })
})
