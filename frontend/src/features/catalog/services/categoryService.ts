import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptCategoriesResponse,
  type Category,
} from '../contracts/catalog'

type CategoryApiClient = Pick<typeof apiClient, 'request'>

export async function fetchCategories(
  signal: AbortSignal,
  client: CategoryApiClient = apiClient,
): Promise<Category[]> {
  const response = await client.request<unknown>('/api/v1/categoria', {
    signal,
  })

  try {
    return adaptCategoriesResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
