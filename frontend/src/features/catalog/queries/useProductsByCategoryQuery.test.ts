import { describe, expect, it, vi } from 'vitest'

import {
  catalogQueryKeys,
  productsByCategoryQueryOptions,
} from './useProductsByCategoryQuery'

const { fetchProductsByCategory } = vi.hoisted(() => ({
  fetchProductsByCategory: vi.fn(),
}))

vi.mock('../services/productsByCategoryService', () => ({
  fetchProductsByCategory,
}))

describe('productsByCategoryQueryOptions', () => {
  it('uses an unambiguous category key under the shared products prefix', () => {
    expect(productsByCategoryQueryOptions(12).queryKey).toEqual([
      'catalog',
      'products',
      'category',
      12,
    ])
    expect(productsByCategoryQueryOptions(12).queryKey).toEqual(
      catalogQueryKeys.byCategory(12),
    )
    expect(catalogQueryKeys.byCategory(12)).toEqual(
      catalogQueryKeys.byCategory(12),
    )
    expect(catalogQueryKeys.byCategory(12)).not.toEqual(
      catalogQueryKeys.byCategory(13),
    )
    expect(catalogQueryKeys.byCategory(12)).not.toEqual(
      catalogQueryKeys.list({ page: 12, size: 20 }),
    )
  })

  it('forwards the query AbortSignal to the service', async () => {
    fetchProductsByCategory.mockResolvedValue({
      products: [],
      pagination: { pages: 0, size: 20, totalItems: 0 },
    })
    const signal = new AbortController().signal
    const options = productsByCategoryQueryOptions(12)

    await options.queryFn?.({ signal } as never)

    expect(fetchProductsByCategory).toHaveBeenCalledWith(12, signal)
  })
})
