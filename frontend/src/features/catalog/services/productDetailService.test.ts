import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { fetchProductDetail } from './productDetailService'

const response = {
  status: true,
  data: {
    produtoId: '42',
    titulo: 'Teclado mecânico',
    descricao: 'Switch azul',
    modelo: 'TK-42',
    foto: null,
    preco: '349.90',
    estoque: '8',
    categoria: { categoriaId: '12', titulo: 'Hardware' },
  },
}

describe('fetchProductDetail', () => {
  it('requests the product URL, forwards cancellation, and adapts the response', async () => {
    const signal = new AbortController().signal
    const client = { request: vi.fn().mockResolvedValue(response) }

    await expect(fetchProductDetail(42, signal, client)).resolves.toEqual({
      id: 42,
      title: 'Teclado mecânico',
      description: 'Switch azul',
      model: 'TK-42',
      photo: null,
      price: 349.9,
      stock: 8,
      category: { id: 12, title: 'Hardware' },
    })
    expect(client.request).toHaveBeenCalledWith('/api/v1/produto/42', {
      signal,
    })
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true }) }

    await expect(
      fetchProductDetail(42, new AbortController().signal, client),
    ).rejects.toMatchObject({ kind: 'contract' } satisfies Partial<AppError>)
  })

  it('preserves a normalized 404 error from the API client', async () => {
    const error = new AppError({
      kind: 'http',
      status: 404,
      message: 'Produto não encontrado.',
    })
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(
      fetchProductDetail(42, new AbortController().signal, client),
    ).rejects.toBe(error)
  })
})
