import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import { adaptCartResponse, type Cart } from '../contracts/cart'

type GetCartApiClient = Pick<typeof apiClient, 'request'>

export async function getCart(
  cartId: number,
  token: string,
  signal?: AbortSignal,
  client: GetCartApiClient = apiClient,
): Promise<Cart> {
  const response = await client.request<unknown>(`/api/v1/carrinho/${cartId}`, {
    token,
    signal,
  })

  try {
    return adaptCartResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
