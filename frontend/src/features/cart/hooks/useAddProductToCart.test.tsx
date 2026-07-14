import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import type { AuthSession } from '../../auth/store/authStore'
import { useCartSessionStore } from '../store/cartSessionStore'
import { useAddProductToCart } from './useAddProductToCart'

const { createMutateAsync, addMutateAsync } = vi.hoisted(() => ({
  createMutateAsync: vi.fn(),
  addMutateAsync: vi.fn(),
}))

vi.mock('../mutations/useCreateCartMutation', () => ({
  useCreateCartMutation: () => ({ mutateAsync: createMutateAsync }),
}))
vi.mock('../mutations/useAddCartItemMutation', () => ({
  useAddCartItemMutation: () => ({ mutateAsync: addMutateAsync }),
}))

const session: AuthSession = {
  token: 'token', tipo: 'Bearer', expiraEm: '2999-01-01T00:00:00.000Z',
  usuarioId: 10, clienteId: 20, email: 'cliente@exemplo.com',
}
const request = { session, productId: 42, quantity: 2, displayedUnitPrice: 349.9 }

describe('useAddProductToCart', () => {
  beforeEach(() => {
    useCartSessionStore.setState({ cartIdsByCustomer: {} })
    createMutateAsync.mockReset().mockImplementation(async ({ customerId }: { customerId: number }) => {
      useCartSessionStore.getState().setCartId(customerId, 100)
      return { id: 100 }
    })
    addMutateAsync.mockReset().mockResolvedValue({ itemId: 7 })
  })

  it('creates a missing cart before adding the first item', async () => {
    const order: string[] = []
    createMutateAsync.mockImplementation(async ({ customerId }: { customerId: number }) => {
      order.push('create')
      useCartSessionStore.getState().setCartId(customerId, 100)
      return { id: 100 }
    })
    addMutateAsync.mockImplementation(async () => { order.push('add'); return { itemId: 7 } })
    const { result } = renderHook(() => useAddProductToCart())

    await act(() => result.current.addProduct(request))

    expect(order).toEqual(['create', 'add'])
    expect(createMutateAsync).toHaveBeenCalledWith({ token: 'token', customerId: 20 })
    expect(addMutateAsync).toHaveBeenCalledWith({
      token: 'token', productId: 42, quantity: 2, displayedUnitPrice: 349.9,
    })
    expect(result.current.isSuccess).toBe(true)
  })

  it('reuses an existing cart without creating another one', async () => {
    useCartSessionStore.getState().setCartId(20, 100)
    const { result } = renderHook(() => useAddProductToCart())

    await act(() => result.current.addProduct(request))

    expect(createMutateAsync).not.toHaveBeenCalled()
    expect(addMutateAsync).toHaveBeenCalledOnce()
  })

  it('does not add when cart creation fails', async () => {
    const error = new AppError({ kind: 'network', message: 'Falha ao criar.' })
    createMutateAsync.mockRejectedValue(error)
    const { result } = renderHook(() => useAddProductToCart())

    await act(() => result.current.addProduct(request))

    expect(addMutateAsync).not.toHaveBeenCalled()
    expect(result.current.error).toBe(error)
    expect(result.current.isSuccess).toBe(false)
  })

  it('keeps the created association when item inclusion fails', async () => {
    const error = new AppError({ kind: 'network', message: 'Falha ao incluir.' })
    addMutateAsync.mockRejectedValue(error)
    const { result } = renderHook(() => useAddProductToCart())

    await act(() => result.current.addProduct(request))

    expect(useCartSessionStore.getState().getCartId(20)).toBe(100)
    expect(result.current.error).toBe(error)
    expect(result.current.isSuccess).toBe(false)
  })

  it('ignores a concurrent confirmation synchronously', async () => {
    let resolveCreate!: (cart: { id: number }) => void
    createMutateAsync.mockReturnValue(new Promise((resolve) => { resolveCreate = resolve }))
    const { result } = renderHook(() => useAddProductToCart())

    let first!: Promise<void>
    await act(async () => {
      first = result.current.addProduct(request)
      await result.current.addProduct(request)
    })

    expect(createMutateAsync).toHaveBeenCalledOnce()
    expect(addMutateAsync).not.toHaveBeenCalled()

    await act(async () => {
      resolveCreate({ id: 100 })
      await first
    })
    expect(addMutateAsync).toHaveBeenCalledOnce()
  })

  it('allows an explicit retry after a failure without retrying automatically', async () => {
    addMutateAsync
      .mockRejectedValueOnce(new AppError({ kind: 'network', message: 'Falha ao incluir.' }))
      .mockResolvedValueOnce({ itemId: 7 })
    const { result } = renderHook(() => useAddProductToCart())

    await act(() => result.current.addProduct(request))
    expect(addMutateAsync).toHaveBeenCalledOnce()

    await act(() => result.current.addProduct(request))
    expect(createMutateAsync).toHaveBeenCalledOnce()
    expect(addMutateAsync).toHaveBeenCalledTimes(2)
    expect(result.current.isSuccess).toBe(true)
  })
})
