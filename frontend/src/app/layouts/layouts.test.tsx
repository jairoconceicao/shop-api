import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AccountLayout } from './AccountLayout'
import { StoreLayout } from './StoreLayout'

function StoreTestProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
    </MemoryRouter>
  )
}

describe('StoreLayout', () => {
  it('keeps the store content between the global header and footer', () => {
    const { container } = render(
      <StoreTestProviders>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<h1>Catálogo</h1>} />
          </Route>
        </Routes>
      </StoreTestProviders>,
    )

    const shell = container.querySelector('[data-shell="store"]')

    expect(shell).toHaveClass('min-h-dvh', 'flex-col')
    expect(shell?.querySelector('header')).toBeInTheDocument()
    expect(shell?.querySelector('main')).toHaveClass('min-w-0', 'flex-1')
    expect(shell?.querySelector('footer')).toBeInTheDocument()
  })
})

describe('AccountLayout', () => {
  it('renders responsive account navigation and marks the current page', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/minha-conta/senha']}>
        <Routes>
          <Route path="minha-conta" element={<AccountLayout />}>
            <Route path="senha" element={<h1>Alterar senha</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const navigation = screen.getByRole('navigation', { name: 'Navegação da conta' })

    expect(navigation).toHaveClass('overflow-x-auto')
    expect(screen.getByRole('link', { name: 'Meus dados' })).toHaveAttribute(
      'href',
      '/minha-conta/dados',
    )
    expect(screen.getByRole('link', { name: 'Trocar senha' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Meus pedidos' })).toHaveAttribute('href', '/pedidos')
    expect(container.querySelector('[data-shell="account"]')).toHaveClass('max-w-3xl')
    expect(screen.getByRole('heading', { name: 'Alterar senha' })).toBeInTheDocument()
  })
})
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
