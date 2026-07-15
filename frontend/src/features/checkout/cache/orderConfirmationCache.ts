import type { QueryClient } from '@tanstack/react-query'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import type { CreatedOrder } from '../contracts/order'

export const orderConfirmationKey = (customerId: number, orderId: number) => (
  ['private', 'order-confirmation', customerId, orderId] as const
)

export function setOrderConfirmation(queryClient: QueryClient, order: CreatedOrder) {
  const key = orderConfirmationKey(order.customerId, order.id)
  queryClient.setQueryDefaults(key, { meta: privateCacheMeta })
  queryClient.setQueryData(key, order)
}

export function getOrderConfirmation(
  queryClient: QueryClient,
  customerId: number,
  orderId: number,
) {
  const order = queryClient.getQueryData<CreatedOrder>(orderConfirmationKey(customerId, orderId))
  return order?.id === orderId && order.customerId === customerId ? order : undefined
}
