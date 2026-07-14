import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { fetchCategories } from './categoryService'

describe('fetchCategories', () => {
  it('requests categories with cancellation support and adapts the response', async () => {
    const signal = new AbortController().signal
    const client = {
      request: vi.fn().mockResolvedValue({
        status: true,
        data: [
          {
            categoriaId: '12',
            titulo: 'Hardware',
            descricao: 'Componentes e periféricos',
          },
        ],
      }),
    }

    await expect(fetchCategories(signal, client)).resolves.toEqual([
      {
        id: 12,
        title: 'Hardware',
        description: 'Componentes e periféricos',
      },
    ])
    expect(client.request).toHaveBeenCalledWith('/api/v1/categoria', { signal })
  })

  it('maps an invalid successful response to a contract error', async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ status: true, data: null }),
    }

    await expect(
      fetchCategories(new AbortController().signal, client),
    ).rejects.toMatchObject({ kind: 'contract' } satisfies Partial<AppError>)
  })

  it('preserves normalized request errors', async () => {
    const error = new AppError({
      kind: 'network',
      message: 'Sem conexão.',
    })
    const client = { request: vi.fn().mockRejectedValue(error) }

    await expect(
      fetchCategories(new AbortController().signal, client),
    ).rejects.toBe(error)
  })
})
