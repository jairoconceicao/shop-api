import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { fetchCatalog } from './catalogService'

const catalogResponse = {
  status: true,
  pagination: {
    pages: '3',
    size: '20',
    totalItems: '41',
    data: [
      {
        produtoId: '42',
        titulo: 'Teclado mecânico',
        thumb: null,
        preco: '349.90',
        estoque: '8',
        categoria: { categoriaId: '12', titulo: 'Hardware' },
      },
    ],
  },
}

describe('fetchCatalog', () => {
  it('requests and adapts a catalog page with encoded search parameters', async () => {
    const signal = new AbortController().signal
    const client = { request: vi.fn().mockResolvedValue(catalogResponse) }

    await expect(
      fetchCatalog(
        { page: 2, size: 20, searchword: 'teclado mecânico' },
        signal,
        client,
      ),
    ).resolves.toEqual({
      products: [
        {
          id: 42,
          title: 'Teclado mecânico',
          thumbnail: null,
          price: 349.9,
          stock: 8,
          category: { id: 12, title: 'Hardware' },
        },
      ],
      pagination: { pages: 3, size: 20, totalItems: 41 },
    })
    expect(client.request).toHaveBeenCalledWith(
      '/api/v1/produto?page=2&size=20&searchword=teclado+mec%C3%A2nico',
      { signal },
    )
  })

  it('omits searchword when it is not supplied', async () => {
    const signal = new AbortController().signal
    const client = { request: vi.fn().mockResolvedValue(catalogResponse) }

    await fetchCatalog({ page: 1, size: 12 }, signal, client)

    expect(client.request).toHaveBeenCalledWith(
      '/api/v1/produto?page=1&size=12',
      { signal },
    )
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ status: true, pagination: null }),
    }

    await expect(
      fetchCatalog(
        { page: 1, size: 20 },
        new AbortController().signal,
        client,
      ),
    ).rejects.toMatchObject({ kind: 'contract' } satisfies Partial<AppError>)
  })

  it('preserves normalized request errors', async () => {
    const error = new AppError({ kind: 'network', message: 'Sem conexão.' })
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(
      fetchCatalog(
        { page: 1, size: 20 },
        new AbortController().signal,
        client,
      ),
    ).rejects.toBe(error)
  })
})
