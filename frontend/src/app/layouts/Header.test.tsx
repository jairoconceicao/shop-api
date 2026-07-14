import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { Header } from './Header'

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Localização atual">{`${location.pathname}${location.search}`}</output>
}

function renderHeader(props: Partial<React.ComponentProps<typeof Header>> = {}) {
  const headerProps = {
    searchword: '',
    onSearchwordChange: () => undefined,
    onSearchSubmit: () => undefined,
    ...props,
  }

  return render(
    <MemoryRouter>
      <Header {...headerProps} />
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

  it('envia o valor controlado da busca', () => {
    const onSearchwordChange = vi.fn()
    const onSearchSubmit = vi.fn()
    renderHeader({ searchword: 'teclado gamer', onSearchwordChange, onSearchSubmit })
    const search = screen.getAllByRole('searchbox', { name: 'Buscar produtos' })[0]

    for (const input of screen.getAllByRole('searchbox', { name: 'Buscar produtos' })) {
      expect(input).toHaveValue('teclado gamer')
    }
    fireEvent.change(search, { target: { value: 'mouse' } })
    fireEvent.submit(search.closest('form')!)

    expect(onSearchwordChange).toHaveBeenCalledWith('mouse')
    expect(onSearchSubmit).toHaveBeenCalledOnce()
  })

  it('oferece navegação SPA pelas categorias em uma faixa horizontal', () => {
    const { container } = renderHeader({
      categories: [
        { id: 10, title: 'Informática' },
        { id: 20, title: 'Casa e cozinha' },
      ],
    })

    const navigation = screen.getByRole('navigation', { name: 'Categorias de produtos' })
    expect(navigation).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Todas as categorias' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Informática' })).toHaveAttribute(
      'href',
      '/?categoria=10',
    )
    expect(screen.getByRole('link', { name: 'Casa e cozinha' })).toHaveAttribute(
      'href',
      '/?categoria=20',
    )
    expect(container.querySelector('.overflow-x-auto')).toContainElement(
      navigation.querySelector('ul'),
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
