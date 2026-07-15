import { apiClient } from '../../../shared/api/apiClient'
import { adaptOrdersPage, type OrdersPage } from '../contracts/orders'

export type ListOrdersParams = {
  cpf: string
  start?: string
  end?: string
  page: number
  size: number
}

export async function listOrders(
  params: ListOrdersParams,
  token: string,
  signal?: AbortSignal,
): Promise<OrdersPage> {
  const query = new URLSearchParams({ cpf: params.cpf })
  if (params.start !== undefined) query.set('dataInicio', params.start)
  if (params.end !== undefined) query.set('dataFim', params.end)
  query.set('page', String(params.page))
  query.set('size', String(params.size))

  const response = await apiClient.request<unknown>(`/api/v1/pedido?${query.toString()}`, {
    method: 'GET',
    token,
    signal,
  })
  return adaptOrdersPage(response)
}
