import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptUpdateCartItemRequest,
  adaptUpdateCartItemResponse,
  type CartItemIdentifier,
} from '../contracts/cart'

type UpdateCartItemApiClient = Pick<typeof apiClient, 'request'>

export async function updateCartItem(
  itemId: number,
  token: string,
  request: unknown,
  client: UpdateCartItemApiClient = apiClient,
): Promise<CartItemIdentifier> {
  let body
  try {
    body = adaptUpdateCartItemRequest(request)
  } catch (error) {
    throw mapContractError(error)
  }

  const response = await client.request<unknown>(`/api/v1/carrinho/items/${itemId}`, {
    method: 'PATCH', token, body,
  })

  try {
    return adaptUpdateCartItemResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
