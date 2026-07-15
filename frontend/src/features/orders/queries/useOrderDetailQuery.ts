import { queryOptions, useQuery } from '@tanstack/react-query'

import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore, type AuthSession } from '../../auth/store/authStore'
import { orderQueryKeys } from '../cache/orderQueryKeys'
import { getOrder } from '../services/getOrderService'

function isPositiveId(value: number | undefined): value is number {
  return value !== undefined && Number.isSafeInteger(value) && value > 0
}

let nextSessionScope = 1
const sessionScopes = new WeakMap<AuthSession, number>()

function getSessionScope(session: AuthSession): number {
  let scope = sessionScopes.get(session)
  if (scope === undefined) {
    scope = nextSessionScope++
    sessionScopes.set(session, scope)
  }
  return scope
}

export function orderDetailQueryOptions(input: {
  customerId?: number
  orderId?: number
  token?: string
  sessionScope?: number
}) {
  const enabled = isPositiveId(input.customerId)
    && isPositiveId(input.orderId)
    && Boolean(input.token?.trim())

  return queryOptions({
    queryKey: enabled
      ? input.sessionScope === undefined
        ? orderQueryKeys.detail(input.customerId!, input.orderId!)
        : [...orderQueryKeys.detail(input.customerId!, input.orderId!), input.sessionScope] as const
      : orderQueryKeys.details(input.customerId ?? -1),
    enabled,
    queryFn: ({ signal }) => getOrder(input.orderId!, input.token!, signal),
    meta: privateCacheMeta,
  })
}

export function useOrderDetailQuery(orderId: number | undefined) {
  const session = useAuthStore((state) => state.session)
  return useQuery(orderDetailQueryOptions({
    customerId: session?.clienteId,
    orderId,
    token: session?.token,
    sessionScope: session ? getSessionScope(session) : undefined,
  }))
}
