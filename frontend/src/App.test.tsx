import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { useAuthStore } from './features/auth/store/authStore'

describe('App', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession(
      {
        token: 'header.payload.signature',
        tipo: 'Bearer',
        expiraEm: '2099-01-01T00:00:00Z',
        usuarioId: 10,
        clienteId: 20,
        email: 'cliente@exemplo.com',
      },
      'session',
    )
  })

  it.each([
    ['/', 'Catálogo'],
    ['/produtos/42', 'Produto'],
    ['/carrinho', 'Carrinho'],
    ['/checkout', 'Checkout'],
    ['/pedido-confirmado/7', 'Pedido confirmado'],
    ['/pedidos', 'Pedidos'],
    ['/pedidos/7', 'Detalhes do pedido'],
  ])('renders the store route %s', (route, heading) => {
    const { container } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
  })

  it.each([
    ['/entrar', 'Entrar na sua conta'],
    ['/cadastro', 'Cadastro'],
  ])('renders the public route %s', (route, heading) => {
    const queryClient = new QueryClient()
    const { container } = render(
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="public"]')).toBeInTheDocument()
  })

  it('renders the not found page with a return to the catalog', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/rota-inexistente']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute('href', '/')
    expect(container.querySelector('[data-shell="public"]')).toBeInTheDocument()
  })

  it.each([
    ['/minha-conta/dados', 'Dados pessoais'],
    ['/minha-conta/senha', 'Alterar senha'],
  ])('nests the account route %s inside the store shell', (route, heading) => {
    const { container } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Minha conta' })).toBeInTheDocument()
  })
})
