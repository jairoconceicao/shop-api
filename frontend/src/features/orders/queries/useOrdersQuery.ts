import { queryOptions, useQuery } from '@tanstack/react-query'

import { normalizeCpf } from '../../../shared/formatting/personalData'
import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore, type AuthSession } from '../../auth/store/authStore'
import type { CustomerProfile } from '../../customer/contracts/customerProfile'
import { useCustomerProfileQuery } from '../../customer/queries/useCustomerProfileQuery'
import { orderQueryKeys } from '../cache/orderQueryKeys'
import { listOrders } from '../services/listOrdersService'

export type OrdersFilters = { start?: string; end?: string; page: number }

let nextSessionScope = 1
const sessionScopes = new WeakMap<AuthSession, WeakMap<CustomerProfile, number>>()

function getSessionScope(session: AuthSession, profile: CustomerProfile): number {
  let profileScopes = sessionScopes.get(session)
  if (profileScopes === undefined) {
    profileScopes = new WeakMap<CustomerProfile, number>()
    sessionScopes.set(session, profileScopes)
  }
  let scope = profileScopes.get(profile)
  if (scope === undefined) {
    scope = nextSessionScope++
    profileScopes.set(profile, scope)
  }
  return scope
}

function isPositiveId(value: number | undefined): value is number {
  return value !== undefined && Number.isSafeInteger(value) && value > 0
}

export function ordersQueryOptions(input: {
  customerId?: number
  cpf?: string
  token?: string
  filters: OrdersFilters
  sessionScope?: number
}) {
  const cpf = normalizeCpf(input.cpf ?? '')
  const enabled = isPositiveId(input.customerId)
    && Boolean(input.token?.trim())
    && cpf.length === 11

  return queryOptions({
    queryKey: enabled
      ? input.sessionScope === undefined
        ? orderQueryKeys.list(input.customerId!, input.filters.start, input.filters.end, input.filters.page, 20)
        : [...orderQueryKeys.list(input.customerId!, input.filters.start, input.filters.end, input.filters.page, 20), input.sessionScope] as const
      : orderQueryKeys.list(0, undefined, undefined, 1, 20),
    enabled,
    queryFn: ({ signal }) => listOrders({
      cpf,
      start: input.filters.start,
      end: input.filters.end,
      page: input.filters.page,
      size: 20,
    }, input.token!, signal),
    meta: privateCacheMeta,
  })
}

export function useOrdersQuery(filters: OrdersFilters) {
  const session = useAuthStore((state) => state.session)
  const profileQuery = useCustomerProfileQuery()
  const cpf = normalizeCpf(profileQuery.data?.cpf ?? '')
  const sessionScope = session && profileQuery.data
    ? getSessionScope(session, profileQuery.data)
    : undefined
  return useQuery(ordersQueryOptions({
    customerId: session?.clienteId,
    cpf,
    token: session?.token,
    filters,
    sessionScope,
  }))
}
