import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OrdersPage } from './OrdersPage'

const { useOrdersQuery } = vi.hoisted(() => ({ useOrdersQuery: vi.fn() }))
vi.mock('../queries/useOrdersQuery', () => ({ useOrdersQuery }))

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

function renderOrders(route = '/pedidos') {
  return render(<MemoryRouter initialEntries={[route]}><OrdersPage /><LocationProbe /></MemoryRouter>)
}

const order = {
  id: 7, cartId: 8, customerId: 20, createdAt: '2026-07-10T12:00:00Z',
  paymentMethod: 'Pix', status: 'Criado',
  deliveryAddress: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' },
  items: [{ itemId: 1, productId: 2, quantity: 1, unitPrice: 99.9 }],
} as const

describe('OrdersPage', () => {
  beforeEach(() => useOrdersQuery.mockReset())

  it('renders stable loading skeletons using the URL filters', () => {
    useOrdersQuery.mockReturnValue({ isPending: true, isError: false })
    renderOrders('/pedidos?dataInicio=2026-07-01&page=2')

    expect(useOrdersQuery).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    expect(screen.getByRole('status', { name: 'Carregando pedidos' })).toHaveClass('min-h-96')
  })

  it('renders a successful page and changes page without a full reload', () => {
    useOrdersQuery.mockReturnValue({ isPending: false, isError: false, data: { pages: 3, size: 20, totalItems: 1, orders: [order] } })
    renderOrders('/pedidos?dataInicio=2026-07-01&page=2')

    expect(screen.getByRole('heading', { level: 1, name: 'Meus pedidos' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Paginação de pedidos' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Página 3' }))
    expect(screen.getByTestId('location')).toHaveTextContent('?dataInicio=2026-07-01&page=3')
  })

  it('renders an empty state with a period reset action only when filtered', () => {
    useOrdersQuery.mockReturnValue({ isPending: false, isError: false, data: { pages: 0, size: 20, totalItems: 0, orders: [] } })
    renderOrders('/pedidos?dataFim=2026-07-15')

    const emptyState = screen.getByRole('heading', { name: 'Nenhum pedido encontrado' }).parentElement!
    fireEvent.click(within(emptyState).getByRole('button', { name: 'Limpar período' }))
    expect(screen.getByTestId('location')).toHaveTextContent('')
  })

  it('renders every query failure as recoverable and retries manually', () => {
    const refetch = vi.fn()
    useOrdersQuery.mockReturnValue({ isPending: false, isError: true, error: { status: 404 }, refetch })
    renderOrders()

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('canonicalizes a reversed period without throwing or querying invalid bounds', async () => {
    useOrdersQuery.mockReturnValue({ isPending: true, isError: false })

    expect(() => renderOrders('/pedidos?dataInicio=2026-07-15&dataFim=2026-07-01&page=2')).not.toThrow()
    expect(useOrdersQuery).toHaveBeenCalledWith({ start: undefined, end: undefined, page: 2 })
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('?page=2'))
  })

  it('reconciles an out-of-range page before rendering the valid API page', async () => {
    useOrdersQuery.mockImplementation((filters?: { page: number }) => filters?.page === 3
      ? { isPending: false, isError: false, data: { pages: 3, size: 20, totalItems: 41, orders: [order] } }
      : { isPending: false, isError: false, data: { pages: 3, size: 20, totalItems: 41, orders: [] } })

    renderOrders('/pedidos?dataInicio=2026-07-01&page=9')

    expect(screen.queryByRole('heading', { name: 'Nenhum pedido encontrado' })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('?dataInicio=2026-07-01&page=3'))
    expect(useOrdersQuery).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3 }))
    expect(screen.getByRole('navigation', { name: 'Paginação de pedidos' })).toBeInTheDocument()
  })
})
