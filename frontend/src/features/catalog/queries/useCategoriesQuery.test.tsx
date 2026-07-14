import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  categoriesQueryOptions,
  categoryQueryKeys,
  useCategoriesQuery,
} from './useCategoriesQuery'

const { fetchCategories } = vi.hoisted(() => ({ fetchCategories: vi.fn() }))

vi.mock('../services/categoryService', () => ({ fetchCategories }))

describe('categoriesQueryOptions', () => {
  it('uses a stable public cache with a long freshness window', () => {
    expect(categoriesQueryOptions()).toMatchObject({
      queryKey: categoryQueryKeys.all,
      staleTime: 30 * 60_000,
      gcTime: 60 * 60_000,
    })
  })
})

describe('useCategoriesQuery', () => {
  it('shares the cached category request between consumers', async () => {
    fetchCategories.mockResolvedValueOnce([
      { id: 12, title: 'Hardware', description: null },
    ])
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const first = renderHook(() => useCategoriesQuery(), { wrapper })
    const second = renderHook(() => useCategoriesQuery(), { wrapper })

    await waitFor(() => expect(first.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true))
    expect(fetchCategories).toHaveBeenCalledOnce()
    expect(second.result.current.data).toEqual([
      { id: 12, title: 'Hardware', description: null },
    ])
  })
})
