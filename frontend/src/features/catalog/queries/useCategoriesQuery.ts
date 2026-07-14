import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchCategories } from '../services/categoryService'

const CATEGORY_STALE_TIME = 30 * 60_000
const CATEGORY_GC_TIME = 60 * 60_000

export const categoryQueryKeys = {
  all: ['catalog', 'categories'] as const,
}

export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: categoryQueryKeys.all,
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: CATEGORY_STALE_TIME,
    gcTime: CATEGORY_GC_TIME,
  })
}

export function useCategoriesQuery() {
  return useQuery(categoriesQueryOptions())
}
