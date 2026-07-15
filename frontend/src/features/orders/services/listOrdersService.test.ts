import { describe, expect, it, vi } from 'vitest'

import { listOrders } from './listOrdersService'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('../../../shared/api/apiClient', () => ({ apiClient: { request } }))

describe('listOrders', () => {
  it('sends cpf, ISO period, page and fixed size with auth and signal', async () => {
    const start = '2026-07-01T00:00:00-03:00'
    const end = '2026-07-15T23:59:59-03:00'
    const signal = new AbortController().signal
    request.mockResolvedValue({ status: true, pagination: { pages: 0, size: 20, totalItems: 0, data: [] } })

    await listOrders({ cpf: '12345678901', start, end, page: 2, size: 20 }, 'token', signal)

    expect(request).toHaveBeenCalledWith(`/api/v1/pedido?cpf=12345678901&dataInicio=${encodeURIComponent(start)}&dataFim=${encodeURIComponent(end)}&page=2&size=20`, {
      method: 'GET', token: 'token', signal,
    })
  })

  it('omits absent period and adapts the response', async () => {
    request.mockResolvedValue({ status: true, pagination: { pages: '0', size: '20', totalItems: '0', data: [] } })
    await expect(listOrders({ cpf: '12345678901', page: 1, size: 20 }, 'token')).resolves.toEqual({ pages: 0, size: 20, totalItems: 0, orders: [] })
    expect(request).toHaveBeenCalledWith('/api/v1/pedido?cpf=12345678901&page=1&size=20', { method: 'GET', token: 'token', signal: undefined })
  })
})
