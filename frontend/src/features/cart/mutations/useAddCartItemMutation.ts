import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productQueryKeys } from '../../catalog/queries/useProductDetailQuery'
import { fetchProductDetail } from '../../catalog/services/productDetailService'
import { AppError } from '../../../shared/errors/appError'
import type { AddedCartItem } from '../contracts/cart'
import { addCartItem } from '../services/addCartItemService'

type AddCartItemVariables = {
  token: string
  productId: number
  quantity: number
  displayedUnitPrice: number
}

export function useAddCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation<AddedCartItem, AppError, AddCartItemVariables>({
    retry: false,
    mutationFn: async ({ token, productId, quantity, displayedUnitPrice }) => {
      const product = await fetchProductDetail(productId, new AbortController().signal)

      queryClient.setQueryData(productQueryKeys.detail(productId), product)

      if (product.price !== displayedUnitPrice) {
        throw new AppError({
          kind: 'http',
          status: 409,
          code: 'PRODUCT_PRICE_CHANGED',
          message: 'O preço do produto mudou. Revise o novo valor e clique novamente para adicionar.',
          details: {
            previousUnitPrice: displayedUnitPrice,
            currentUnitPrice: product.price,
          },
        })
      }

      return addCartItem(token, {
        produtoId: product.id,
        quantidade: quantity,
        valorUnitario: product.price,
      })
    },
  })
}
