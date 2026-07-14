import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptAddCartItemRequest,
  adaptAddCartItemResponse,
  type AddedCartItem,
} from '../contracts/cart'

type AddCartItemApiClient = Pick<typeof apiClient, 'request'>

export async function addCartItem(
  token: string,
  request: unknown,
  client: AddCartItemApiClient = apiClient,
): Promise<AddedCartItem> {
  let body

  try {
    body = adaptAddCartItemRequest(request)
  } catch (error) {
    throw mapContractError(error)
  }

  const response = await client.request<unknown>('/api/v1/carrinho/items', {
    method: 'POST',
    token,
    body,
  })

  try {
    return adaptAddCartItemResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
