import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from './server'

describe('MSW test server', () => {
  it('intercepts requests registered by a test', async () => {
    server.use(
      http.get('http://localhost/health', () =>
        HttpResponse.json({ status: 'ok' }),
      ),
    )

    const response = await fetch('http://localhost/health')

    await expect(response.json()).resolves.toEqual({ status: 'ok' })
  })
})
