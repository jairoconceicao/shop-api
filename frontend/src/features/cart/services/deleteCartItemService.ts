import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import { adaptDeleteCartItemResponse, type CartItemIdentifier } from '../contracts/cart'

type DeleteCartItemApiClient = Pick<typeof apiClient, 'request'>

export async function deleteCartItem(
  itemId: number,
  token: string,
  client: DeleteCartItemApiClient = apiClient,
): Promise<CartItemIdentifier> {
  const response = await client.request<unknown>(`/api/v1/carrinho/items/${itemId}`, {
    method: 'DELETE', token,
  })

  try {
    return adaptDeleteCartItemResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
