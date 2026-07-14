import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  catalogQueryKeys,
  catalogQueryOptions,
  useCatalogQuery,
} from './useCatalogQuery'

const { fetchCatalog } = vi.hoisted(() => ({ fetchCatalog: vi.fn() }))

vi.mock('../services/catalogService', () => ({ fetchCatalog }))

const catalogPage = {
  products: [],
  pagination: { pages: 0, size: 20, totalItems: 0 },
}

beforeEach(() => {
  fetchCatalog.mockReset()
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('catalogQueryOptions', () => {
  it('uses page, size and searchword in the cache key', () => {
    const params = { page: 2, size: 20, searchword: 'teclado' }

    expect(catalogQueryOptions(params).queryKey).toEqual(
      catalogQueryKeys.list(params),
    )
    expect(catalogQueryKeys.list(params)).toEqual([
      'catalog',
      'products',
      params,
    ])
  })
})

describe('useCatalogQuery', () => {
  it('shares a request between consumers with equal parameters', async () => {
    fetchCatalog.mockResolvedValue(catalogPage)
    const wrapper = createWrapper()

    const first = renderHook(
      () => useCatalogQuery({ page: 1, size: 20, searchword: 'mouse' }),
      { wrapper },
    )
    const second = renderHook(
      () => useCatalogQuery({ page: 1, size: 20, searchword: 'mouse' }),
      { wrapper },
    )

    await waitFor(() => expect(first.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true))
    expect(fetchCatalog).toHaveBeenCalledOnce()
    expect(fetchCatalog).toHaveBeenCalledWith(
      { page: 1, size: 20, searchword: 'mouse' },
      expect.any(AbortSignal),
    )
  })

  it('issues separate requests when catalog parameters change', async () => {
    fetchCatalog.mockResolvedValue(catalogPage)
    const wrapper = createWrapper()

    const first = renderHook(() => useCatalogQuery({ page: 1, size: 20 }), {
      wrapper,
    })
    const second = renderHook(() => useCatalogQuery({ page: 2, size: 20 }), {
      wrapper,
    })

    await waitFor(() => expect(first.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true))
    expect(fetchCatalog).toHaveBeenCalledTimes(2)
  })
})
