import { queryOptions, useQuery } from '@tanstack/react-query'

import { normalizeCpf } from '../../../shared/formatting/personalData'
import { privateCacheMeta } from '../../../shared/query/privateCache'
import { useAuthStore } from '../../auth/store/authStore'
import { useCustomerProfileQuery } from '../../customer/queries/useCustomerProfileQuery'
import { orderQueryKeys } from '../cache/orderQueryKeys'
import { listOrders } from '../services/listOrdersService'

export type OrdersFilters = { start?: string; end?: string; page: number }

function isPositiveId(value: number | undefined): value is number {
  return value !== undefined && Number.isSafeInteger(value) && value > 0
}

export function ordersQueryOptions(input: {
  customerId?: number
  cpf?: string
  token?: string
  filters: OrdersFilters
}) {
  const cpf = normalizeCpf(input.cpf ?? '')
  const enabled = isPositiveId(input.customerId)
    && Boolean(input.token?.trim())
    && cpf.length === 11

  return queryOptions({
    queryKey: enabled
      ? orderQueryKeys.list(input.customerId!, input.filters.start, input.filters.end, input.filters.page, 20)
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
  return useQuery(ordersQueryOptions({
    customerId: session?.clienteId,
    cpf: profileQuery.data?.cpf,
    token: session?.token,
    filters,
  }))
}
