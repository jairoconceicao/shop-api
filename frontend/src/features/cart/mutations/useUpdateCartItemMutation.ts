import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AppError } from '../../../shared/errors/appError'
import type { Cart, CartItem, CartItemIdentifier } from '../contracts/cart'
import { cartCache, reconcileActiveCart, updateExistingCart } from '../cache/cartCache'
import { updateCartItem } from '../services/updateCartItemService'

type Options = { customerId: number; cartId: number; itemId: number; token: string }
type Context = { previousItem?: CartItem }

function restorePreviousItem(
  queryClient: ReturnType<typeof useQueryClient>,
  customerId: number,
  cartId: number,
  itemId: number,
  previousItem: CartItem | undefined,
) {
  if (!previousItem) return
  updateExistingCart(queryClient, customerId, cartId, (current) => ({
    ...current,
    items: current.items.map((item) => item.id === itemId ? previousItem : item),
  }))
}

export function useUpdateCartItemMutation({ customerId, cartId, itemId, token }: Options) {
  const queryClient = useQueryClient()
  const queryKey = cartCache.query.detail(customerId, cartId)

  return useMutation<CartItemIdentifier, AppError, number, Context>({
    mutationKey: cartCache.mutation.update(customerId, cartId, itemId),
    meta: cartCache.meta,
    scope: { id: cartCache.scope.item(customerId, cartId, itemId) },
    retry: false,
    mutationFn: (quantity) => updateCartItem(itemId, token, { quantidade: quantity }),
    onMutate: async (quantity) => {
      await queryClient.cancelQueries({ queryKey, exact: true })
      const cart = queryClient.getQueryData<Cart>(queryKey)
      const previousItem = cart?.items.find((item) => item.id === itemId)
      if (cart && previousItem) {
        queryClient.setQueryData<Cart>(queryKey, {
          ...cart,
          items: cart.items.map((item) => item.id === itemId ? { ...item, quantity } : item),
        })
      }
      return { previousItem }
    },
    onError: (_error, _quantity, context) => {
      restorePreviousItem(queryClient, customerId, cartId, itemId, context?.previousItem)
    },
    onSuccess: async (_result, _quantity, context) => {
      const reconciled = await reconcileActiveCart(queryClient, customerId, cartId)
      if (!reconciled) {
        restorePreviousItem(queryClient, customerId, cartId, itemId, context?.previousItem)
      }
    },
  })
}
