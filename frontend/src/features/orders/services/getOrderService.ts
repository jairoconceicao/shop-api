import { apiClient } from '../../../shared/api/apiClient'
import { adaptOrderResponse, type Order } from '../contracts/orders'

export async function getOrder(
  orderId: number,
  token: string,
  signal?: AbortSignal,
): Promise<Order> {
  const response = await apiClient.request<unknown>(`/api/v1/pedido/${orderId}`, {
    method: 'GET',
    token,
    signal,
  })
  return adaptOrderResponse(response)
}
