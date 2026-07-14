import { describe, expect, it, vi } from 'vitest'

import { logout } from './logoutService'

describe('logout', () => {
  it('posts the protected remote logout request', async () => {
    const client = { request: vi.fn().mockResolvedValue(undefined) }

    await expect(logout('access-token', client)).resolves.toBeUndefined()
    expect(client.request).toHaveBeenCalledWith('/api/v1/auth/logout', {
      method: 'POST',
      token: 'access-token',
    })
  })
})
