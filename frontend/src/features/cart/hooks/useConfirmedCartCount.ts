import { useIsMutating } from '@tanstack/react-query'
import { useState } from 'react'

import { useCartQuery } from '../queries/useCartQuery'

function isOptimisticCartMutation(mutation: { options: { mutationKey?: readonly unknown[] } }) {
  const key = mutation.options.mutationKey

  return key?.[0] === 'cart'
    && key[1] === 'item'
    && (key[2] === 'delete' || key[3] === 'quantity')
}

export function useConfirmedCartCount() {
  const cartQuery = useCartQuery()
  const optimisticMutations = useIsMutating({ predicate: isOptimisticCartMutation })
  const rawCount = cartQuery.data?.items.reduce(
    (total, item) => total + item.quantity,
    0,
  ) ?? 0
  const [confirmedCount, setConfirmedCount] = useState(rawCount)

  if (optimisticMutations === 0 && confirmedCount !== rawCount) {
    setConfirmedCount(rawCount)
  }

  return !cartQuery.hasCart || cartQuery.isError ? 0 : confirmedCount
}
