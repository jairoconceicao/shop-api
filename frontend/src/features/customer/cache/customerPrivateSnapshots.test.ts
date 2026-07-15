import { describe, expect, it, vi } from 'vitest'
import { clearCustomerPrivateSnapshots, registerCustomerPrivateSnapshot } from './customerPrivateSnapshots'

describe('customerPrivateSnapshots', () => {
  it('clears only the requested customer and unregisters snapshots', () => {
    const first = vi.fn(); const removed = vi.fn(); const other = vi.fn()
    registerCustomerPrivateSnapshot(7, first)
    const unregister = registerCustomerPrivateSnapshot(7, removed)
    registerCustomerPrivateSnapshot(8, other)
    unregister()
    clearCustomerPrivateSnapshots(7)
    expect(first).toHaveBeenCalledOnce()
    expect(removed).not.toHaveBeenCalled()
    expect(other).not.toHaveBeenCalled()
    clearCustomerPrivateSnapshots(7)
    expect(first).toHaveBeenCalledOnce()
  })
})
