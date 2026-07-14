import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../errors/appError'
import { createApiClient } from './apiClient'

describe('apiClient', () => {
  it('notifies unauthorized responses only for authenticated requests', async () => {
    const onUnauthorized = vi.fn()
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(null, { status: 401 }))
    const client = createApiClient({ baseUrl: 'https://api.example.com', fetch, onUnauthorized })

    await expect(client.request('/profile', { token: 'expired-token' })).rejects.toMatchObject({
      status: 401,
    })
    await expect(client.request('/login')).rejects.toMatchObject({ status: 401 })

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('combines the base URL and path and sends JSON', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = createApiClient({ baseUrl: 'https://api.example.com/api/v1', fetch })

    await expect(
      client.request('/products', {
        method: 'POST',
        body: { name: 'Keyboard' },
        token: 'access-token',
      }),
    ).resolves.toEqual({ data: { id: 1 } })

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/products',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Keyboard' }),
      }),
    )

    const headers = new Headers(fetch.mock.calls[0]?.[1]?.headers)
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer access-token')
  })

  it('omits the optional Bearer header', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(undefined, { status: 204 }),
    )
    const client = createApiClient({ baseUrl: 'https://api.example.com', fetch })

    await expect(client.request('/health')).resolves.toBeUndefined()

    const headers = new Headers(fetch.mock.calls[0]?.[1]?.headers)
    expect(headers.has('Authorization')).toBe(false)
    expect(headers.has('Content-Type')).toBe(false)
  })

  it('forwards the AbortSignal and preserves cancellation errors', async () => {
    const controller = new AbortController()
    const cancellation = new DOMException('Aborted', 'AbortError')
    const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(cancellation)
    const client = createApiClient({ baseUrl: 'https://api.example.com', fetch })
    controller.abort()

    await expect(client.request('/products', { signal: controller.signal })).rejects.toBe(
      cancellation,
    )
    expect(fetch.mock.calls[0]?.[1]?.signal).toBe(controller.signal)
  })

  it('normalizes HTTP, network, and invalid JSON errors', async () => {
    const httpClient = createApiClient({
      baseUrl: 'https://api.example.com',
      fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: 'conflict', message: 'Conflict' } }), {
          status: 409,
        }),
      ),
    })
    const networkClient = createApiClient({
      baseUrl: 'https://api.example.com',
      fetch: vi.fn<typeof globalThis.fetch>().mockRejectedValue(new TypeError('Failed to fetch')),
    })
    const contractClient = createApiClient({
      baseUrl: 'https://api.example.com',
      fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response('not-json')),
    })

    await expect(httpClient.request('/products')).rejects.toMatchObject({
      kind: 'http',
      status: 409,
      code: 'conflict',
    } satisfies Partial<AppError>)
    await expect(networkClient.request('/products')).rejects.toMatchObject({ kind: 'network' })
    await expect(contractClient.request('/products')).rejects.toMatchObject({ kind: 'contract' })
  })
})
