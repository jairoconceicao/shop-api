import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchProductsByCategory } from '../services/productsByCategoryService'
import { catalogQueryKeys as sharedCatalogQueryKeys } from './useCatalogQuery'

export const catalogQueryKeys = {
  ...sharedCatalogQueryKeys,
  byCategory: (categoryId: number) =>
    [...sharedCatalogQueryKeys.all, 'category', categoryId] as const,
}

export function productsByCategoryQueryOptions(categoryId: number) {
  return queryOptions({
    queryKey: catalogQueryKeys.byCategory(categoryId),
    queryFn: ({ signal }) => fetchProductsByCategory(categoryId, signal),
  })
}

export function useProductsByCategoryQuery(categoryId: number) {
  return useQuery(productsByCategoryQueryOptions(categoryId))
}
