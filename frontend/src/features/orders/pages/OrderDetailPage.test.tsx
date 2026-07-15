import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { OrderDetailPage } from './OrderDetailPage'

const { useOrderDetailQuery } = vi.hoisted(() => ({ useOrderDetailQuery: vi.fn() }))
vi.mock('../queries/useOrderDetailQuery', () => ({ useOrderDetailQuery }))

const order = {
  id: 41, cartId: 9, customerId: 7, createdAt: '2026-07-15T12:00:00Z', paymentMethod: 'Pix', status: 'Criado',
  deliveryAddress: { logradouro: 'Rua A', numero: '10', complemento: 'Apto 2', cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' },
  items: [{ itemId: 3, productId: 5, quantity: 2, unitPrice: 12.5 }],
} as const

function renderDetail(route = '/pedidos/41') {
  return render(<MemoryRouter initialEntries={[route]}><Routes><Route path="/pedidos/:pedidoId" element={<OrderDetailPage />} /></Routes></MemoryRouter>)
}

describe('OrderDetailPage', () => {
  beforeEach(() => useOrderDetailQuery.mockReset())

  it('renders confirmed address, payment, status, items and derived total', () => {
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false, data: order })
    renderDetail()
    expect(screen.getByRole('heading', { level: 1, name: 'Pedido 41' })).toBeInTheDocument()
    expect(screen.getByText('Pix')).toBeInTheDocument()
    expect(screen.getByText('Criado')).toBeInTheDocument()
    expect(screen.getByText('Rua A, 10')).toBeInTheDocument()
    expect(screen.getByText('Produto 5')).toBeInTheDocument()
    expect(screen.getByText('R$ 25,00')).toBeInTheDocument()
  })

  it('renders loading, invalid route and explicit API 404 states', () => {
    useOrderDetailQuery.mockReturnValue({ isPending: true, isError: false })
    const view = renderDetail()
    expect(screen.getByRole('status', { name: 'Carregando pedido' })).toHaveClass('min-h-96')
    view.unmount()
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false })
    renderDetail('/pedidos/01')
    expect(screen.getByRole('heading', { name: 'Pedido não encontrado' })).toBeInTheDocument()
    expect(useOrderDetailQuery).toHaveBeenLastCalledWith(undefined)
  })

  it('renders 404 as not found and retries other errors', () => {
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: true, error: new AppError({ kind: 'http', status: 404, message: 'ausente' }) })
    const view = renderDetail()
    expect(screen.getByRole('heading', { name: 'Pedido não encontrado' })).toBeInTheDocument()
    view.unmount()
    const refetch = vi.fn()
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: true, error: new AppError({ kind: 'network', message: 'offline' }), refetch })
    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(refetch).toHaveBeenCalledOnce()
  })
})
