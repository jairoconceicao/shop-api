import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
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
    ['/entrar', 'Entrar'],
    ['/cadastro', 'Cadastro'],
    ['/rota-inexistente', 'Página não encontrada'],
  ])('renders the public route %s', (route, heading) => {
    const { container } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
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
