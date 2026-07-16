import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreatedOrder } from '../contracts/order'
import { CheckoutPage } from './CheckoutPage'

const { mutateAsync, navigate, reset, mutationState } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  navigate: vi.fn(),
  reset: vi.fn(),
  mutationState: {
    error: null as Error | null,
    isPending: false,
  },
}))

vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-router-dom')>(),
  useNavigate: () => navigate,
  useOutletContext: () => undefined,
}))

vi.mock('../mutations/useCreateOrderMutation', () => ({
  useCreateOrderMutation: () => ({
    error: mutationState.error,
    isPending: mutationState.isPending,
    mutateAsync,
    reset,
  }),
}))

const cart = {
  customerId: 7,
  id: 70,
  createdAt: '2026-07-16T10:00:00Z',
  items: [{ id: 701, productId: 42, quantity: 2, unitPrice: 199.9 }],
}

const profile = {
  customerId: 7,
  address: {
    logradouro: 'Rua A',
    numero: '10',
    complemento: null,
    cep: '01001000',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
  },
}

const createdOrder: CreatedOrder = {
  id: 900,
  customerId: 7,
  createdAt: '2026-07-16T12:00:00.000Z',
  paymentMethod: 'Pix',
  status: 'Criado',
  total: 399.8,
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, reject, resolve }
}

function renderPage() {
  return render(<CheckoutPage cart={cart} profile={profile} />)
}

describe('CheckoutPage mutation Promise navigation', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    navigate.mockReset()
    reset.mockReset()
    mutationState.error = null
    mutationState.isPending = false
  })

  it('navigates from the mutateAsync result after the checkout observer unmounts', async () => {
    const order = deferred<CreatedOrder>()
    mutateAsync.mockReturnValueOnce(order.promise)
    const view = renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    expect(reset).toHaveBeenCalledOnce()
    view.unmount()
    order.resolve(createdOrder)
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/pedido-confirmado/900'))
  })

  it('unlocks submission after mutateAsync rejects', async () => {
    const first = deferred<CreatedOrder>()
    mutateAsync.mockReturnValueOnce(first.promise).mockResolvedValueOnce(createdOrder)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    expect(mutateAsync).toHaveBeenCalledOnce()
    first.reject(new Error('pedido recusado'))
    await first.promise.catch(() => undefined)
    await Promise.resolve()
    expect(navigate).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pedido' }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2))
    expect(reset).toHaveBeenCalledTimes(2)
    expect(navigate).toHaveBeenCalledWith('/pedido-confirmado/900')
  })
})
