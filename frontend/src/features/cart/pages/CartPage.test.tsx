import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Cart } from '../contracts/cart'
import { CartPage } from './CartPage'

const { cartQuery, deleteMutation, productsQuery, updateMutation, useCartProductsQuery, useDeleteCartItemMutation, useUpdateCartItemMutation } = vi.hoisted(() => ({
  cartQuery: {
    data: undefined as Cart | undefined,
    hasCart: false,
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  },
  productsQuery: {
    data: [] as Array<Record<string, unknown>>,
    isPending: false,
    refetch: vi.fn(),
  },
  useCartProductsQuery: vi.fn(),
  useDeleteCartItemMutation: vi.fn(),
  useUpdateCartItemMutation: vi.fn(),
  deleteMutation: { error: null as Error | null, isError: false, isPending: false, isSuccess: false, mutate: vi.fn(), reset: vi.fn() },
  updateMutation: { error: null as Error | null, isError: false, isPending: false, isSuccess: false, mutate: vi.fn(), reset: vi.fn() },
}))

vi.mock('../queries/useCartQuery', () => ({ useCartQuery: () => cartQuery }))
vi.mock('../queries/useCartProductsQuery', () => ({
  useCartProductsQuery: (items: unknown[]) => useCartProductsQuery(items),
}))
vi.mock('../mutations/useUpdateCartItemMutation', () => ({
  useUpdateCartItemMutation: (options: unknown) => useUpdateCartItemMutation(options),
}))
vi.mock('../mutations/useDeleteCartItemMutation', () => ({
  useDeleteCartItemMutation: (options: unknown) => useDeleteCartItemMutation(options),
}))
vi.mock('../../auth/store/authStore', () => ({ useAuthStore: (selector: (state: unknown) => unknown) => selector({ session: { token: 'token' } }) }))

const cart: Cart = {
  customerId: 20,
  id: 900,
  createdAt: '2026-07-14T12:00:00Z',
  items: [
    { id: 8, productId: 2, quantity: 2, unitPrice: 125.5 },
    { id: 7, productId: 1, quantity: 1, unitPrice: 49.9 },
  ],
}

function product(productId: number, title: string) {
  return {
    status: 'success',
    productId,
    product: {
      id: productId,
      title,
      description: null,
      model: null,
      photo: null,
      price: 9999,
      stock: 10,
      category: { id: 3, title: 'Categoria' },
    },
  }
}

function renderPage() {
  return render(<MemoryRouter><CartPage /></MemoryRouter>)
}

describe('CartPage', () => {
  beforeEach(() => {
    Object.assign(cartQuery, {
      data: undefined,
      hasCart: false,
      isError: false,
      isPending: false,
    })
    Object.assign(productsQuery, { data: [], isPending: false })
    cartQuery.refetch.mockReset()
    productsQuery.refetch.mockReset()
    useCartProductsQuery.mockReset().mockReturnValue(productsQuery)
    Object.assign(updateMutation, { error: null, isError: false, isPending: false, isSuccess: false })
    updateMutation.mutate.mockReset()
    updateMutation.reset.mockReset()
    useUpdateCartItemMutation.mockReset().mockReturnValue(updateMutation)
    Object.assign(deleteMutation, { error: null, isError: false, isPending: false, isSuccess: false })
    deleteMutation.mutate.mockReset()
    deleteMutation.reset.mockReset()
    useDeleteCartItemMutation.mockReset().mockReturnValue(deleteMutation)
  })

  it('shows the empty state without a cart association and still calls hydration at the top level', () => {
    renderPage()

    expect(useCartProductsQuery).toHaveBeenCalledWith([])
    expect(screen.getByRole('heading', { level: 1, name: 'Carrinho' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute('href', '/')
  })

  it('renders an accessible loading status while the confirmed cart is pending', () => {
    Object.assign(cartQuery, { hasCart: true, isPending: true })

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando carrinho')
    expect(screen.getAllByTestId('cart-item-skeleton')).toHaveLength(2)
  })

  it('renders a recoverable error that manually retries the cart query', () => {
    Object.assign(cartQuery, { hasCart: true, isError: true })

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(cartQuery.refetch).toHaveBeenCalledOnce()
  })

  it('keeps remote item order and calculates subtotal and total only from cart snapshots', () => {
    Object.assign(cartQuery, { data: cart, hasCart: true })
    productsQuery.data = [product(1, 'Primeiro produto'), product(2, 'Segundo produto')]

    renderPage()

    const list = screen.getByRole('list', { name: 'Itens do carrinho' })
    const items = within(list).getAllByRole('listitem')
    expect(within(items[0]).getByRole('heading', { name: 'Segundo produto' })).toBeInTheDocument()
    expect(within(items[1]).getByRole('heading', { name: 'Primeiro produto' })).toBeInTheDocument()

    const summary = screen.getByRole('complementary', { name: 'Resumo do carrinho' })
    expect(within(summary).getByText('Subtotal').nextElementSibling).toHaveTextContent('R$ 300,90')
    expect(within(summary).getByText('Total').nextElementSibling).toHaveTextContent('R$ 300,90')
    expect(within(summary).queryByText(/frete|desconto/i)).not.toBeInTheDocument()
    expect(screen.queryByText('R$ 9.999,00')).not.toBeInTheDocument()
  })

  it('keeps failed product hydration actionable without hiding successful items', () => {
    Object.assign(cartQuery, { data: cart, hasCart: true })
    productsQuery.data = [
      product(1, 'Produto disponível'),
      { status: 'error', productId: 2, error: new Error('private upstream detail') },
    ]

    renderPage()

    expect(screen.getByRole('heading', { name: 'Produto 2' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Produto disponível' })).toBeInTheDocument()
    expect(screen.queryByText(/private upstream detail/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar Produto 2 novamente' }))
    expect(productsQuery.refetch).toHaveBeenCalledOnce()
  })

  it('shows the empty state when the confirmed cart has no items', () => {
    Object.assign(cartQuery, { data: { ...cart, items: [] }, hasCart: true })

    renderPage()

    expect(screen.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeInTheDocument()
  })

  it('updates quantity within product stock and locks the control while pending', () => {
    Object.assign(cartQuery, { data: cart, hasCart: true })
    productsQuery.data = [product(1, 'Primeiro'), product(2, 'Segundo')]
    updateMutation.isPending = true
    renderPage()

    const quantity = screen.getByRole('spinbutton', { name: 'Quantidade de Segundo' })
    expect(quantity).toHaveAttribute('max', '10')
    expect(quantity).toBeDisabled()
    expect(useUpdateCartItemMutation).toHaveBeenCalledWith({ customerId: 20, cartId: 900, itemId: 8, token: 'token' })
  })

  it('does not offer quantity editing when product hydration failed', () => {
    Object.assign(cartQuery, { data: cart, hasCart: true })
    productsQuery.data = [{ status: 'error', productId: 2, error: new Error('fail') }, product(1, 'Primeiro')]
    renderPage()
    expect(screen.queryByRole('spinbutton', { name: /Produto 2/ })).not.toBeInTheDocument()
  })

  it('shows an actionable update error and retries the selected quantity manually', () => {
    Object.assign(cartQuery, { data: { ...cart, items: [cart.items[0]] }, hasCart: true })
    productsQuery.data = [product(2, 'Segundo')]
    Object.assign(updateMutation, { isError: true, error: new Error('private') })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar atualizar quantidade novamente' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível atualizar a quantidade')
    expect(screen.queryByText('private')).not.toBeInTheDocument()
    expect(updateMutation.mutate).toHaveBeenCalledWith(2)
  })

  it('announces success only after the mutation resolves', async () => {
    Object.assign(cartQuery, { data: { ...cart, items: [cart.items[0]] }, hasCart: true })
    productsQuery.data = [product(2, 'Segundo')]
    updateMutation.isSuccess = true
    renderPage()
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Quantidade atualizada'))
  })

  it('requires an accessible confirmation with safe initial focus before deleting', () => {
    Object.assign(cartQuery, { data: { ...cart, items: [cart.items[0]] }, hasCart: true })
    productsQuery.data = [product(2, 'Segundo')]
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Remover Segundo' }))
    const dialog = screen.getByRole('dialog', { name: 'Remover item do carrinho?' })
    expect(within(dialog).getByText(/Segundo/)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    expect(deleteMutation.mutate).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remover item' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Remover item' }))
    expect(deleteMutation.mutate).toHaveBeenCalledOnce()
    expect(deleteMutation.mutate).toHaveBeenCalledWith(8, expect.objectContaining({ onSuccess: expect.any(Function) }))
  })

  it('locks confirmation while pending and keeps the selected item in the dialog after optimistic unmount', () => {
    Object.assign(cartQuery, { data: { ...cart, items: [cart.items[0]] }, hasCart: true })
    productsQuery.data = [product(2, 'Segundo')]
    const view = renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Remover Segundo' }))
    Object.assign(deleteMutation, { isPending: true })
    Object.assign(cartQuery, { data: { ...cart, items: [] } })
    view.rerender(<MemoryRouter><CartPage /></MemoryRouter>)

    const dialog = screen.getByRole('dialog', { name: 'Remover item do carrinho?' })
    expect(within(dialog).getByText(/Segundo/)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Removendo…' })).toBeDisabled()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('keeps a failed deletion open and retries only by explicit action', () => {
    Object.assign(cartQuery, { data: { ...cart, items: [cart.items[0]] }, hasCart: true })
    productsQuery.data = [product(2, 'Segundo')]
    Object.assign(deleteMutation, { isError: true, error: new Error('private') })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Remover Segundo' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Não foi possível remover o item')
    expect(within(dialog).queryByText('private')).not.toBeInTheDocument()
    expect(deleteMutation.mutate).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tentar remover novamente' }))
    expect(deleteMutation.mutate).toHaveBeenCalledWith(8, expect.objectContaining({ onError: expect.any(Function) }))
  })

  it('reflects optimistic totals and restores them with the item after rollback', () => {
    Object.assign(cartQuery, { data: cart, hasCart: true })
    productsQuery.data = [product(1, 'Primeiro'), product(2, 'Segundo')]
    const view = renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Remover Segundo' }))

    Object.assign(deleteMutation, { isPending: true })
    Object.assign(cartQuery, { data: { ...cart, items: [cart.items[1]] } })
    view.rerender(<MemoryRouter><CartPage /></MemoryRouter>)
    expect(within(screen.getByRole('complementary', { name: 'Resumo do carrinho' })).getByText('Total').nextElementSibling).toHaveTextContent('R$ 49,90')

    Object.assign(deleteMutation, { isPending: false, isError: true })
    Object.assign(cartQuery, { data: cart })
    view.rerender(<MemoryRouter><CartPage /></MemoryRouter>)
    expect(within(screen.getByRole('complementary', { name: 'Resumo do carrinho' })).getByText('Total').nextElementSibling).toHaveTextContent('R$ 300,90')
    expect(screen.getByRole('dialog')).toHaveTextContent('Não foi possível remover o item')
  })

  it('closes, announces success and recovers focus after deletion succeeds', async () => {
    Object.assign(cartQuery, { data: { ...cart, items: [cart.items[0]] }, hasCart: true })
    productsQuery.data = [product(2, 'Segundo')]
    deleteMutation.mutate.mockImplementation((_itemId: number, options: { onSuccess?: () => void }) => options.onSuccess?.())
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Remover Segundo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remover item' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('Segundo removido do carrinho')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Carrinho' })).toHaveFocus())
  })
})
