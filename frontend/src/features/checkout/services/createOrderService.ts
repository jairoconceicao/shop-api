import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptCreateOrderRequest,
  adaptCreatedOrderResponse,
  type CreatedOrder,
  type CreateOrderRequest,
} from '../contracts/order'

type CreateOrderApiClient = Pick<typeof apiClient, 'request'>
type CreateOrderInput = Omit<CreateOrderRequest, 'dataPedido'>

export async function createOrder(
  input: CreateOrderInput,
  token: string,
  now: () => Date = () => new Date(),
  signal?: AbortSignal,
  client: CreateOrderApiClient = apiClient,
): Promise<CreatedOrder> {
  let body: CreateOrderRequest

  try {
    body = adaptCreateOrderRequest({
      ...input,
      dataPedido: now().toISOString(),
    })
  } catch (error) {
    throw mapContractError(error)
  }

  const response = await client.request<unknown>('/api/v1/pedido', {
    method: 'POST',
    token,
    signal,
    body,
  })

  try {
    return adaptCreatedOrderResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
