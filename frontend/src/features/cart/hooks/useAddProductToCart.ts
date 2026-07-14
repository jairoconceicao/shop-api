import { useCallback, useRef, useState } from 'react'

import type { AppError } from '../../../shared/errors/appError'
import type { AuthSession } from '../../auth/store/authStore'
import { useAddCartItemMutation } from '../mutations/useAddCartItemMutation'
import { useCreateCartMutation } from '../mutations/useCreateCartMutation'
import { useCartSessionStore } from '../store/cartSessionStore'

type AddProductRequest = {
  session: AuthSession
  productId: number
  quantity: number
  displayedUnitPrice: number
}

export function useAddProductToCart() {
  const createCart = useCreateCartMutation()
  const addCartItem = useAddCartItemMutation()
  const pendingRef = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const addProduct = useCallback(async ({
    session,
    productId,
    quantity,
    displayedUnitPrice,
  }: AddProductRequest) => {
    if (pendingRef.current) return

    pendingRef.current = true
    setIsPending(true)
    setIsSuccess(false)
    setError(null)

    try {
      const existingCartId = useCartSessionStore.getState().getCartId(session.clienteId)

      const cartId = existingCartId ?? (await createCart.mutateAsync({
        token: session.token,
        customerId: session.clienteId,
        reconcile: false,
      })).id

      await addCartItem.mutateAsync({
        token: session.token,
        customerId: session.clienteId,
        cartId,
        productId,
        quantity,
        displayedUnitPrice,
      })
      setIsSuccess(true)
    } catch (caughtError) {
      setError(caughtError as AppError)
    } finally {
      pendingRef.current = false
      setIsPending(false)
    }
  }, [addCartItem, createCart])

  return { addProduct, error, isPending, isSuccess }
}
