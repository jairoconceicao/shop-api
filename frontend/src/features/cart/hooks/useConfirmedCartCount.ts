import { useMutationState } from '@tanstack/react-query'
import { useState } from 'react'

import type { CartItem } from '../contracts/cart'
import { useAuthStore } from '../../auth/store/authStore'
import { useCartQuery } from '../queries/useCartQuery'
import { useCartSessionStore } from '../store/cartSessionStore'

type OptimisticMutation = {
  kind: 'update' | 'delete'
  context?: { previousItem?: CartItem; item?: CartItem }
  variables?: unknown
}

function isActiveCartMutation(
  mutation: { options: { mutationKey?: readonly unknown[] } },
  customerId: number | undefined,
  cartId: number | undefined,
) {
  const key = mutation.options.mutationKey

  return key?.[0] === 'cart'
    && key[1] === 'item'
    && (key[2] === 'update' || key[2] === 'delete')
    && key[3] === customerId
    && key[4] === cartId
}

export function useConfirmedCartCount() {
  const cartQuery = useCartQuery()
  const customerId = useAuthStore((state) => state.session?.clienteId)
  const cartId = useCartSessionStore((state) =>
    customerId === undefined ? undefined : state.cartIdsByCustomer[String(customerId)],
  )
  const optimisticMutations = useMutationState<OptimisticMutation>({
    filters: {
      status: 'pending',
      predicate: (mutation) => isActiveCartMutation(mutation, customerId, cartId),
    },
    select: (mutation) => ({
      kind: mutation.options.mutationKey?.[2] as 'update' | 'delete',
      context: mutation.state.context as OptimisticMutation['context'],
      variables: mutation.state.variables,
    }),
  })
  const rawCount = cartQuery.data?.items.reduce(
    (total, item) => total + item.quantity,
    0,
  ) ?? 0
  const reconstructedCount = optimisticMutations.reduce((count, mutation) => {
    if (mutation.kind === 'delete') {
      return count + (mutation.context?.item?.quantity ?? 0)
    }

    const optimisticQuantity = typeof mutation.variables === 'number' ? mutation.variables : 0
    return count + (mutation.context?.previousItem?.quantity ?? optimisticQuantity) - optimisticQuantity
  }, rawCount)
  const [confirmedCount, setConfirmedCount] = useState(reconstructedCount)

  if (optimisticMutations.length === 0 && confirmedCount !== rawCount) {
    setConfirmedCount(rawCount)
  }

  return !cartQuery.hasCart || cartQuery.isError ? 0 : confirmedCount
}
