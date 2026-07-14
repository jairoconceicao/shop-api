import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import { adaptCreateCartResponse, type CreatedCart } from '../contracts/cart'

type CreateCartApiClient = Pick<typeof apiClient, 'request'>

export async function createCart(
  token: string,
  client: CreateCartApiClient = apiClient,
): Promise<CreatedCart> {
  const response = await client.request<unknown>('/api/v1/carrinho/criar', {
    method: 'POST',
    token,
  })

  try {
    return adaptCreateCartResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
