import type { QueryClient } from '@tanstack/react-query'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import type { CreatedOrder } from '../contracts/order'

export const orderConfirmationKey = (orderId: number) => (
  ['private', 'order-confirmation', orderId] as const
)

export function setOrderConfirmation(queryClient: QueryClient, order: CreatedOrder) {
  const key = orderConfirmationKey(order.id)
  queryClient.setQueryDefaults(key, { meta: privateCacheMeta })
  queryClient.setQueryData(key, order)
}

export function getOrderConfirmation(queryClient: QueryClient, orderId: number) {
  const order = queryClient.getQueryData<CreatedOrder>(orderConfirmationKey(orderId))
  return order?.id === orderId ? order : undefined
}
