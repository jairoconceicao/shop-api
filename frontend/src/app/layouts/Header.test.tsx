import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { Header } from './Header'

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Localização atual">{`${location.pathname}${location.search}`}</output>
}

function renderHeader(props: Partial<React.ComponentProps<typeof Header>> = {}, initialEntry = '/') {
  const headerProps = {
    searchword: '',
    onSearchwordChange: () => undefined,
    onSearchSubmit: () => undefined,
    ...props,
  }

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
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

  it('exibe a quantidade do carrinho com nome acessível e badge visual', () => {
    const { container, rerender } = renderHeader({ cartCount: 1 })

    expect(screen.getByRole('link', { name: 'Carrinho com 1 item' })).toHaveAttribute('href', '/carrinho')
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <Header
          searchword=""
          onSearchwordChange={() => undefined}
          onSearchSubmit={() => undefined}
          cartCount={3}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Carrinho com 3 itens' })).toBeInTheDocument()
  })

  it('não exibe badge quando o contador confirmado é zero', () => {
    renderHeader({ cartCount: 0 })

    expect(screen.getByRole('link', { name: 'Carrinho' })).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
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
      '/?categoriaId=10',
    )
    expect(screen.getByRole('link', { name: 'Casa e cozinha' })).toHaveAttribute(
      'href',
      '/?categoriaId=20',
    )
    expect(container.querySelector('.overflow-x-auto')).toContainElement(
      navigation.querySelector('ul'),
    )
  })

  it('preserva a busca, remove a página e marca a categoria selecionada', () => {
    renderHeader({
      categories: [{ id: 10, title: 'Informática' }],
      selectedCategoryId: 10,
      searchword: 'ssd',
    }, '/?searchword=ssd&categoriaId=10&page=4')

    expect(screen.getByRole('link', { name: 'Informática' })).toHaveAttribute(
      'href',
      '/?searchword=ssd&categoriaId=10',
    )
    expect(screen.getByRole('link', { name: 'Informática' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Todas as categorias' })).not.toHaveAttribute('aria-current')
  })

  it('limpa todos os filtros ao selecionar todas as categorias', () => {
    renderHeader({ selectedCategoryId: 10 }, '/?searchword=ssd&categoriaId=10&page=4')

    expect(screen.getByRole('link', { name: 'Todas as categorias' })).toHaveAttribute('href', '/')
    fireEvent.click(screen.getByRole('link', { name: 'Todas as categorias' }))
    expect(screen.getByLabelText('Localização atual')).toHaveTextContent(/^\/$/)
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
