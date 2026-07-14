import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { fetchProductsByCategory } from './productsByCategoryService'

const response = {
  status: true,
  pagination: {
    pages: '2',
    size: 20,
    totalItems: '21',
    data: [
      {
        produtoId: 42,
        titulo: 'Teclado mecânico',
        thumb: null,
        preco: '349.90',
        estoque: '0',
        categoria: { categoriaId: '12', titulo: 'Hardware' },
      },
    ],
  },
}

describe('fetchProductsByCategory', () => {
  it('requests the exact category path without query parameters and adapts the page', async () => {
    const signal = new AbortController().signal
    const client = { request: vi.fn().mockResolvedValue(response) }

    await expect(fetchProductsByCategory(12, signal, client)).resolves.toEqual({
      products: [
        {
          id: 42,
          title: 'Teclado mecânico',
          thumbnail: null,
          price: 349.9,
          stock: 0,
          category: { id: 12, title: 'Hardware' },
        },
      ],
      pagination: { pages: 2, size: 20, totalItems: 21 },
    })
    expect(client.request).toHaveBeenCalledWith(
      '/api/v1/produto/categoria/12',
      { signal },
    )
  })

  it('uses the requested category id in the category path', async () => {
    const client = { request: vi.fn().mockResolvedValue(response) }

    await fetchProductsByCategory(987, new AbortController().signal, client)

    expect(client.request).toHaveBeenCalledWith(
      '/api/v1/produto/categoria/987',
      expect.any(Object),
    )
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ status: true, pagination: null }),
    }

    await expect(
      fetchProductsByCategory(12, new AbortController().signal, client),
    ).rejects.toMatchObject({ kind: 'contract' } satisfies Partial<AppError>)
  })

  it('preserves normalized request errors', async () => {
    const error = new AppError({ kind: 'network', message: 'Sem conexão.' })
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(
      fetchProductsByCategory(12, new AbortController().signal, client),
    ).rejects.toBe(error)
  })
})
