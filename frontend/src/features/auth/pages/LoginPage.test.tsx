import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { PropsWithChildren } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '../../../shared/testing/server'
import { useAuthStore } from '../store/authStore'
import { LoginPage } from './LoginPage'

function renderPage(initialState?: unknown) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <MemoryRouter initialEntries={[{ pathname: '/entrar', state: initialState }]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<ReturnDestination />} />
          <Route path="entrar" element={children} />
          <Route path="produtos/:produtoId" element={<ReturnDestination />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  )

  return render(<LoginPage />, { wrapper })
}

function ReturnDestination() {
  const location = useLocation()

  return <p>{`${location.pathname}${location.search}${location.hash}`}</p>
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
  })

  it('shows the registration confirmation received through navigation state', () => {
    renderPage({ registrationSucceeded: true })

    expect(screen.getByRole('status')).toHaveTextContent('Cadastro concluído')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Sua conta foi criada. Entre com as credenciais cadastradas.',
    )
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
    expect(screen.getByRole('alert')).toHaveFocus()
    expect(requests).toBe(0)
  })

  it.each([
    { keepConnected: false, persistence: 'session' as const },
    { keepConnected: true, persistence: 'local' as const },
  ])('stores the session using $persistence persistence', async ({ keepConnected, persistence }) => {
    let requestBody: unknown
    server.use(
      http.post('https://api.example.com/api/v1/auth/login', async ({ request }) => {
        requestBody = await request.json()

        return HttpResponse.json({
          status: true,
          data: {
            token: 'header.payload.signature',
            tipo: 'Bearer',
            expiraEm: '2099-07-14T18:00:00-03:00',
            usuarioId: 10,
            clienteId: 20,
            email: 'cliente@exemplo.com',
          },
        })
      }),
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
    expect(requestBody).toEqual({ email: 'cliente@exemplo.com', senha: 'senha-secreta' })
    expect(useAuthStore.getState().persistence).toBe(persistence)
    expect(await screen.findByText('/')).toBeInTheDocument()
  })

  it('returns to the origin after login without adding an item automatically', async () => {
    let cartRequests = 0
    server.use(
      http.post('https://api.example.com/api/v1/auth/login', () =>
        HttpResponse.json({
          status: true,
          data: {
            token: 'header.payload.signature',
            tipo: 'Bearer',
            expiraEm: '2099-07-14T18:00:00-03:00',
            usuarioId: 10,
            clienteId: 20,
            email: 'cliente@exemplo.com',
          },
        }),
      ),
      http.post('https://api.example.com/api/v1/carrinho/criar', () => {
        cartRequests += 1
        return HttpResponse.json({})
      }),
      http.post('https://api.example.com/api/v1/carrinho/:carrinhoId/itens', () => {
        cartRequests += 1
        return HttpResponse.json({})
      }),
    )
    renderPage({ returnTo: '/produtos/42?origem=catalogo#comprar' })

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'cliente@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-secreta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('/produtos/42?origem=catalogo#comprar')).toBeInTheDocument()
    expect(cartRequests).toBe(0)
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
