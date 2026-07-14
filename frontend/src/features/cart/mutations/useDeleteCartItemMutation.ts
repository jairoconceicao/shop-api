import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AppError } from '../../../shared/errors/appError'
import { privateCacheMeta } from '../../../shared/query/privateCache'
import type { Cart, CartItem, CartItemIdentifier } from '../contracts/cart'
import { cartQueryKeys } from '../queries/useCartQuery'
import { deleteCartItem } from '../services/deleteCartItemService'

type Options = { customerId: number; cartId: number; token: string }
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

export function useDeleteCartItemMutation({ customerId, cartId, token }: Options) {
  const queryClient = useQueryClient()
  const queryKey = cartQueryKeys.detail(customerId, cartId)

  return useMutation<CartItemIdentifier, AppError, number, Context>({
    mutationKey: ['cart', 'item', 'delete', customerId, cartId],
    meta: privateCacheMeta,
    retry: false,
    mutationFn: (itemId) => deleteCartItem(itemId, token),
    onMutate: async (itemId) => {
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
    onError: (_error, _itemId, context) => {
      if (!context?.item || !queryClient.getQueryData(queryKey)) return
      queryClient.setQueryData<Cart>(queryKey, (current) => current && ({
        ...current,
        items: restoreItem(current.items, context),
      }))
    },
  })
}
