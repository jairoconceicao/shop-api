import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '../../../shared/testing/server'
import { useAuthStore } from '../store/authStore'
import { LoginPage } from './LoginPage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  )

  return render(<LoginPage />, { wrapper })
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
  })

  it('validates credentials before sending the login request', async () => {
    let requests = 0
    server.use(
      http.post('https://api.example.com/api/v1/auth/login', () => {
        requests += 1
        return HttpResponse.json({})
      }),
    )
    renderPage()

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'email-invalido' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findAllByText('Informe um e-mail válido.')).toHaveLength(2)
    expect(screen.getAllByText('Informe sua senha.')).toHaveLength(2)
    expect(requests).toBe(0)
  })

  it.each([
    { keepConnected: false, persistence: 'session' as const },
    { keepConnected: true, persistence: 'local' as const },
  ])('stores the session using $persistence persistence', async ({ keepConnected, persistence }) => {
    server.use(
      http.post('https://api.example.com/api/v1/auth/login', () =>
        HttpResponse.json({
          status: true,
          data: {
            token: 'header.payload.signature',
            tipo: 'Bearer',
            expiraEm: '2026-07-14T18:00:00-03:00',
            usuarioId: 10,
            clienteId: 20,
            email: 'cliente@exemplo.com',
          },
        }),
      ),
    )
    renderPage()

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'cliente@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-secreta' } })
    if (keepConnected) {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Manter conectado' }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(useAuthStore.getState().session?.clienteId).toBe(20))
    expect(useAuthStore.getState().persistence).toBe(persistence)
    expect(screen.getByLabelText('E-mail')).toHaveValue('')
    expect(screen.getByLabelText('Senha')).toHaveValue('')
    expect(screen.getByRole('checkbox', { name: 'Manter conectado' })).not.toBeChecked()
  })

  it('shows an authentication error and has no password recovery action', async () => {
    server.use(
      http.post('https://api.example.com/api/v1/auth/login', () =>
        HttpResponse.json(
          { error: { message: 'E-mail ou senha inválidos.' } },
          { status: 401 },
        ),
      ),
    )
    renderPage()

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'cliente@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-incorreta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toHaveValue('cliente@exemplo.com')
    expect(screen.getByLabelText('Senha')).toHaveValue('')
    expect(screen.queryByText(/esqueci|recuper/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Criar agora' })).toHaveAttribute('href', '/cadastro')
  })
})
