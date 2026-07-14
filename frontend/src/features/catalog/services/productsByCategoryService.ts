import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptCatalogResponse,
  type CatalogPage,
} from '../contracts/catalog'

type CatalogApiClient = Pick<typeof apiClient, 'request'>

export async function fetchProductsByCategory(
  categoryId: number,
  signal: AbortSignal,
  client: CatalogApiClient = apiClient,
): Promise<CatalogPage> {
  const response = await client.request<unknown>(
    `/api/v1/produto/categoria/${encodeURIComponent(String(categoryId))}`,
    { signal },
  )

  try {
    return adaptCatalogResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
