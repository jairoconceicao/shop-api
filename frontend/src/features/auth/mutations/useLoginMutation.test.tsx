import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { server } from '../../../shared/testing/server'
import { useLoginMutation } from './useLoginMutation'

describe('useLoginMutation', () => {
  it('executes login once and exposes the adapted session', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
    let requests = 0

    server.use(
      http.post('https://api.example.com/api/v1/auth/login', () => {
        requests += 1

        return HttpResponse.json({
          status: true,
          data: {
            token: 'header.payload.signature',
            tipo: 'Bearer',
            expiraEm: '2026-07-14T18:00:00-03:00',
            usuarioId: 9999,
            clienteId: 8888,
            email: 'cliente@exemplo.com',
          },
        })
      }),
    )

    const queryClient = new QueryClient()
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useLoginMutation(), { wrapper })

    act(() => {
      result.current.mutate({
        email: 'cliente@exemplo.com',
        senha: 'senha-secreta',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.clienteId).toBe(8888)
    expect(requests).toBe(1)
  })
})
