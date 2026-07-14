import { queryOptions, useQuery } from '@tanstack/react-query'

import {
  fetchCatalog,
  type CatalogQueryParams,
} from '../services/catalogService'

export const catalogQueryKeys = {
  all: ['catalog', 'products'] as const,
  list: (params: CatalogQueryParams) =>
    [...catalogQueryKeys.all, { ...params }] as const,
}

export function catalogQueryOptions(params: CatalogQueryParams) {
  const queryParams = { ...params }

  return queryOptions({
    queryKey: catalogQueryKeys.list(queryParams),
    queryFn: ({ signal }) => fetchCatalog(queryParams, signal),
  })
}

export function useCatalogQuery(params: CatalogQueryParams) {
  return useQuery(catalogQueryOptions(params))
}
