import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import {
  isProductNotFoundError,
  productDetailQueryOptions,
  productQueryKeys,
} from './useProductDetailQuery'

const { fetchProductDetail } = vi.hoisted(() => ({
  fetchProductDetail: vi.fn(),
}))

vi.mock('../services/productDetailService', () => ({ fetchProductDetail }))

describe('productDetailQueryOptions', () => {
  it('uses a stable detail key for the canonical product id', () => {
    expect(productDetailQueryOptions('42').queryKey).toEqual([
      'catalog',
      'products',
      'detail',
      42,
    ])
    expect(productDetailQueryOptions('42').queryKey).toEqual(
      productQueryKeys.detail(42),
    )
  })

  it('disables the query when the route id is invalid', () => {
    expect(productDetailQueryOptions(undefined).enabled).toBe(false)
    expect(productDetailQueryOptions('01').enabled).toBe(false)
  })

  it('forwards the query AbortSignal to the detail service', async () => {
    const signal = new AbortController().signal
    const options = productDetailQueryOptions('42')

    await options.queryFn?.({ signal } as never)

    expect(fetchProductDetail).toHaveBeenCalledWith(42, signal)
  })

  it('does not override global cache or retry defaults', () => {
    const options = productDetailQueryOptions('42')

    expect(options).not.toHaveProperty('staleTime')
    expect(options).not.toHaveProperty('gcTime')
    expect(options).not.toHaveProperty('retry')
  })

  it('identifies only normalized HTTP 404 errors as product not found', () => {
    expect(
      isProductNotFoundError(
        new AppError({ kind: 'http', status: 404, message: 'Not found' }),
      ),
    ).toBe(true)
    expect(
      isProductNotFoundError(
        new AppError({ kind: 'http', status: 500, message: 'Server error' }),
      ),
    ).toBe(false)
    expect(isProductNotFoundError(new Error('Not found'))).toBe(false)
  })
})
