import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { Header } from './Header'

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Localização atual">{`${location.pathname}${location.search}`}</output>
}

function renderHeader(props: React.ComponentProps<typeof Header> = {}) {
  return render(
    <MemoryRouter>
      <Header {...props} />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('Header', () => {
  it('exibe marca, busca, carrinho e menu para visitante', () => {
    renderHeader()

    expect(screen.getByRole('link', { name: 'Shop — ir ao catálogo' })).toHaveAttribute('href', '/')
    expect(screen.getAllByRole('searchbox', { name: 'Buscar produtos' })).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Carrinho' })).toHaveAttribute('href', '/carrinho')

    fireEvent.click(screen.getByRole('button', { name: 'Área do cliente' }))
    expect(screen.getByRole('menuitem', { name: 'Entrar' })).toHaveAttribute('href', '/entrar')
    expect(screen.queryByRole('menuitem', { name: 'Sair' })).not.toBeInTheDocument()
  })

  it('envia uma busca normalizada para a URL do catálogo', () => {
    renderHeader()
    const search = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    fireEvent.change(search, { target: { value: '  teclado gamer  ' } })
    fireEvent.submit(search.closest('form')!)

    expect(screen.getByRole('status', { name: 'Localização atual' })).toHaveTextContent(
      '/?busca=teclado%20gamer',
    )
  })

  it('reflete o cliente autenticado e oferece suas ações', () => {
    const onSignOut = vi.fn()
    renderHeader({ customer: { name: 'João Cliente', email: 'joao@exemplo.com' }, onSignOut })

    fireEvent.click(screen.getByRole('button', { name: 'Área do cliente' }))

    expect(screen.getByText('João Cliente')).toBeInTheDocument()
    expect(screen.getByText('joao@exemplo.com')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Meus pedidos' })).toHaveAttribute('href', '/pedidos')
    expect(screen.getByRole('menuitem', { name: 'Meus dados' })).toHaveAttribute('href', '/minha-conta/dados')

    fireEvent.click(screen.getByRole('menuitem', { name: 'Sair' }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })
})
