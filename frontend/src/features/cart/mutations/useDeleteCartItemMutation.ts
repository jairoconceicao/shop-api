import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AppError } from '../../../shared/errors/appError'
import type { Cart, CartItem, CartItemIdentifier } from '../contracts/cart'
import { cartCache, reconcileActiveCart, updateExistingCart, waitForCartItemMutation } from '../cache/cartCache'
import { deleteCartItem } from '../services/deleteCartItemService'

type Options = { customerId: number; cartId: number; itemId: number; token: string }
type Context = {
  item?: CartItem
  index: number
  previousItemId?: number
  nextItemId?: number
}

function restoreItem(items: CartItem[], context: Context): CartItem[] {
  if (!context.item || items.some((item) => item.id === context.item!.id)) return items

  const previousIndex = context.previousItemId === undefined
    ? -1
    : items.findIndex((item) => item.id === context.previousItemId)
  const nextIndex = context.nextItemId === undefined
    ? -1
    : items.findIndex((item) => item.id === context.nextItemId)
  const insertionIndex = previousIndex >= 0
    ? previousIndex + 1
    : nextIndex >= 0
      ? nextIndex
      : Math.min(context.index, items.length)

  return [...items.slice(0, insertionIndex), context.item, ...items.slice(insertionIndex)]
}

export function useDeleteCartItemMutation({ customerId, cartId, itemId, token }: Options) {
  const queryClient = useQueryClient()
  const queryKey = cartCache.query.detail(customerId, cartId)

  return useMutation<CartItemIdentifier, AppError, void, Context>({
    mutationKey: cartCache.mutation.delete(customerId, cartId, itemId),
    meta: cartCache.meta,
    scope: { id: cartCache.scope.item(customerId, cartId, itemId) },
    retry: false,
    mutationFn: () => deleteCartItem(itemId, token),
    onMutate: async () => {
      await waitForCartItemMutation(
        queryClient,
        cartCache.mutation.update(customerId, cartId, itemId),
      )
      await queryClient.cancelQueries({ queryKey, exact: true })
      const cart = queryClient.getQueryData<Cart>(queryKey)
      const index = cart?.items.findIndex((item) => item.id === itemId) ?? -1
      const item = index >= 0 ? cart?.items[index] : undefined
      const context = {
        item,
        index: Math.max(index, 0),
        previousItemId: index > 0 ? cart?.items[index - 1]?.id : undefined,
        nextItemId: index >= 0 ? cart?.items[index + 1]?.id : undefined,
      }
      if (cart && item) {
        queryClient.setQueryData<Cart>(queryKey, {
          ...cart,
          items: cart.items.filter((current) => current.id !== itemId),
        })
      }
      return context
    },
    onError: (_error, _variables, context) => {
      if (!context?.item) return
      updateExistingCart(queryClient, customerId, cartId, (current) => ({
        ...current, items: restoreItem(current.items, context),
      }))
    },
    onSuccess: async (_result, _variables, context) => {
      const reconciled = await reconcileActiveCart(queryClient, customerId, cartId)
      if (!reconciled && context?.item) {
        updateExistingCart(queryClient, customerId, cartId, (current) => ({
          ...current, items: restoreItem(current.items, context),
        }))
      }
    },
  })
}
