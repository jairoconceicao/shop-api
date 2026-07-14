import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AppError } from '../../../shared/errors/appError'
import type { Cart, CartItem, CartItemIdentifier } from '../contracts/cart'
import { cartQueryKeys } from '../queries/useCartQuery'
import { updateCartItem } from '../services/updateCartItemService'

type Options = { customerId: number; cartId: number; itemId: number; token: string }
type Context = { previousItem?: CartItem }

export function useUpdateCartItemMutation({ customerId, cartId, itemId, token }: Options) {
  const queryClient = useQueryClient()
  const queryKey = cartQueryKeys.detail(customerId, cartId)

  return useMutation<CartItemIdentifier, AppError, number, Context>({
    mutationKey: ['cart', 'item', itemId, 'quantity'],
    scope: { id: `cart-item-${itemId}` },
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
      if (!context?.previousItem || !queryClient.getQueryData(queryKey)) return
      queryClient.setQueryData<Cart>(queryKey, (current) => current && ({
        ...current,
        items: current.items.map((item) => item.id === itemId ? context.previousItem! : item),
      }))
    },
  })
}
