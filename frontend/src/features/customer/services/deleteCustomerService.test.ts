import { describe, expect, it, vi } from 'vitest'
import { AppError } from '../../../shared/errors/appError'
import { deleteCustomer } from './deleteCustomerService'

describe('deleteCustomer', () => {
  it('sends the exact DELETE without a body and adapts the matching customer ID', async () => {
    const client = { request: vi.fn().mockResolvedValue({ status: true, data: { clienteId: 7 } }) }
    await expect(deleteCustomer({ customerId: 7, token: 'token' }, client)).resolves.toEqual({ customerId: 7 })
    expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/7', { method: 'DELETE', token: 'token' })
  })

  it.each([
    { status: true, data: { clienteId: 8 } },
    { status: false, data: { clienteId: 7 } },
    null,
  ])('maps an invalid or divergent response to a contract error', async (response) => {
    const client = { request: vi.fn().mockResolvedValue(response) }
    await expect(deleteCustomer({ customerId: 7, token: 'token' }, client)).rejects.toMatchObject({ kind: 'contract' } satisfies Partial<AppError>)
  })
})
