import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptCatalogResponse,
  type CatalogPage,
} from '../contracts/catalog'

export type CatalogQueryParams = {
  page: number
  size: number
  searchword?: string
}

type CatalogApiClient = Pick<typeof apiClient, 'request'>

export async function fetchCatalog(
  params: CatalogQueryParams,
  signal: AbortSignal,
  client: CatalogApiClient = apiClient,
): Promise<CatalogPage> {
  const query = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  })

  if (params.searchword !== undefined) {
    query.set('searchword', params.searchword)
  }

  const response = await client.request<unknown>(
    `/api/v1/produto?${query.toString()}`,
    { signal },
  )

  try {
    return adaptCatalogResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
