import { apiClient } from '../../../shared/api/apiClient'
import { adaptCancelledOrderResponse, createCancelOrderRequest, type CancelledOrder } from '../contracts/orders'

export type CancelOrderInput = {
  orderId: number
  token: string
  signal?: AbortSignal
}

export async function cancelOrder({ orderId, token, signal }: CancelOrderInput): Promise<CancelledOrder> {
  const response = await apiClient.request<unknown>(`/api/v1/pedido/${orderId}`, {
    method: 'PATCH',
    token,
    body: createCancelOrderRequest(),
    signal,
  })

  return adaptCancelledOrderResponse(response)
}
