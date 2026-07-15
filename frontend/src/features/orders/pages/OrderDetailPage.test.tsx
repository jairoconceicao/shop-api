import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { OrderDetailPage } from './OrderDetailPage'

const { mutateAsync, useCancelOrderMutation, useOrderDetailQuery, useOrderProductsQuery } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  useCancelOrderMutation: vi.fn(),
  useOrderDetailQuery: vi.fn(),
  useOrderProductsQuery: vi.fn(),
}))
vi.mock('../mutations/useCancelOrderMutation', () => ({ useCancelOrderMutation }))
vi.mock('../queries/useOrderDetailQuery', () => ({ useOrderDetailQuery }))
vi.mock('../queries/useOrderProductsQuery', () => ({ useOrderProductsQuery }))

const order = {
  id: 41, cartId: 9, customerId: 7, createdAt: '2026-07-15T12:00:00Z', paymentMethod: 'Pix', status: 'Criado',
  deliveryAddress: { logradouro: 'Rua A', numero: '10', complemento: 'Apto 2', cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' },
  items: [{ itemId: 3, productId: 5, quantity: 2, unitPrice: 12.5 }],
} as const

function renderDetail(route = '/pedidos/41') {
  return render(<MemoryRouter initialEntries={[route]}><Routes><Route path="/pedidos/:pedidoId" element={<OrderDetailPage />} /></Routes></MemoryRouter>)
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    useAuthStore.getState().clearSession()
    useAuthStore.getState().setSession({ token: 'token', tipo: 'Cliente', expiraEm: '2099-01-01T00:00:00Z', usuarioId: 3, clienteId: 7, email: 'a@b.com' }, 'session')
    useCancelOrderMutation.mockReturnValue({ mutateAsync, isPending: false, error: null, reset: vi.fn() })
    useOrderDetailQuery.mockReset()
    useOrderProductsQuery.mockReturnValue({
      data: [{
        status: 'success',
        productId: 5,
        product: { id: 5, title: 'Mouse sem fio', photo: null },
      }],
    })
  })

  it('renders confirmed address, payment, status, items and derived total', () => {
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false, data: order })
    renderDetail()
    expect(screen.getByRole('heading', { level: 1, name: 'Pedido 41' })).toBeInTheDocument()
    expect(screen.getByText('Pix')).toBeInTheDocument()
    expect(screen.getByText('Criado')).toBeInTheDocument()
    expect(screen.getByText('Rua A, 10')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mouse sem fio' })).toBeInTheDocument()
    expect(screen.getAllByText('R$ 25,00')).toHaveLength(2)
  })

  it('renders loading, invalid route and explicit API 404 states', () => {
    useOrderDetailQuery.mockReturnValue({ isPending: true, isError: false })
    const view = renderDetail()
    expect(screen.getByRole('status', { name: 'Carregando pedido' })).toHaveClass('min-h-96')
    view.unmount()
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false })
    renderDetail('/pedidos/01')
    expect(screen.getByRole('heading', { level: 1, name: 'Pedido não encontrado' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(useOrderDetailQuery).toHaveBeenLastCalledWith(undefined)
  })

  it('renders 404 as not found and retries other errors', () => {
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: true, error: new AppError({ kind: 'http', status: 404, message: 'ausente' }) })
    const view = renderDetail()
    expect(screen.getByRole('heading', { level: 1, name: 'Pedido não encontrado' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    view.unmount()
    const refetch = vi.fn()
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: true, error: new AppError({ kind: 'network', message: 'offline' }), refetch })
    renderDetail()
    expect(screen.getByRole('heading', { level: 1, name: 'Não foi possível carregar o pedido' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('confirms cancellation with the captured order and session and closes on success', async () => {
    mutateAsync.mockResolvedValue({ id: 41, customerId: 7, createdAt: order.createdAt, status: 'Cancelado' })
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false, data: order })
    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar pedido' }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ orderId: 41, customerId: 7, userId: 3, token: 'token' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('blocks duplicate confirmation before the pending state renders', () => {
    mutateAsync.mockReturnValue(new Promise(() => undefined))
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false, data: order })
    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    const confirm = within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar pedido' })
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    expect(mutateAsync).toHaveBeenCalledOnce()
  })

  it('announces a rejected cancellation without changing the confirmed order', async () => {
    mutateAsync.mockResolvedValue({ kind: 'cancel-rejected' })
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false, data: { ...order, status: 'Processado' } })
    renderDetail()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar pedido' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('cancelamento não foi aceito')
    expect(screen.getByText('Processado')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mutateAsync).toHaveBeenCalledOnce()
  })

  it.each(['Cancelado', 'Devolvido'] as const)('hides cancellation for %s orders', (status) => {
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false, data: { ...order, status } })
    renderDetail()
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
  })

  it('keeps cancellation available for statuses decided by the API', () => {
    useOrderDetailQuery.mockReturnValue({ isPending: false, isError: false, data: { ...order, status: 'Processado' } })
    renderDetail()
    expect(screen.getByRole('button', { name: 'Cancelar pedido' })).toBeInTheDocument()
  })
})
