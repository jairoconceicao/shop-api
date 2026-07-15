import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { AppError } from '../../../shared/errors/appError'
import { Button } from '../../../shared/ui/buttons/Button'
import { Skeleton } from '../../../shared/ui/states/Skeleton'
import { OrderItem } from '../components/OrderItem'
import { calculateOrderTotal, getOrderStatusLabel } from '../formatting/orderPresentation'
import { useOrderDetailQuery } from '../queries/useOrderDetailQuery'
import { useOrderProductsQuery } from '../queries/useOrderProductsQuery'
import { parseOrderId } from '../routing/orderId'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

function PageState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="surface flex flex-col items-center px-6 py-10 text-center">
      <h1 className="text-xl font-semibold text-zinc-100 sm:text-2xl">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

function NotFoundState() {
  return <PageState title="Pedido não encontrado" description="Verifique o endereço ou consulte seus pedidos." />
}

export function OrderDetailPage() {
  const { pedidoId } = useParams()
  const orderId = parseOrderId(pedidoId)
  const query = useOrderDetailQuery(orderId)
  const productsQuery = useOrderProductsQuery(query.data?.items ?? [])

  if (orderId === undefined) {
    return <section className="container-page py-8 sm:py-10"><NotFoundState /></section>
  }

  if (query.isPending) {
    return (
      <section className="container-page py-8 sm:py-10">
        <div role="status" aria-label="Carregando pedido" aria-live="polite" className="min-h-96 space-y-4">
          <span className="sr-only">Carregando pedido…</span>
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </section>
    )
  }

  if (query.isError) {
    if (query.error instanceof AppError && query.error.status === 404) {
      return <section className="container-page py-8 sm:py-10"><NotFoundState /></section>
    }
    return (
      <section className="container-page py-8 sm:py-10">
        <PageState
          title="Não foi possível carregar o pedido"
          description="Ocorreu um erro ao consultar os dados confirmados deste pedido."
          action={<Button onClick={() => void query.refetch()}>Tentar novamente</Button>}
        />
      </section>
    )
  }

  const order = query.data
  const productsById = new Map(productsQuery.data?.map((result) => [result.productId, result]))
  return (
    <section className="container-page py-8 sm:py-10" aria-labelledby="order-title">
      <header className="mb-6">
        <h1 id="order-title" className="text-2xl font-bold text-zinc-50 sm:text-3xl">Pedido {order.id}</h1>
        <p className="mt-2 text-sm text-zinc-400">Realizado em {dateTime.format(new Date(order.createdAt))}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-4 sm:p-6" aria-labelledby="order-summary-title">
          <h2 id="order-summary-title" className="text-lg font-semibold text-zinc-50">Resumo</h2>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-zinc-400">Status</dt><dd className="font-medium text-zinc-100">{getOrderStatusLabel(order.status)}</dd>
            <dt className="text-zinc-400">Pagamento</dt><dd className="font-medium text-zinc-100">{order.paymentMethod}</dd>
          </dl>
        </section>

        <section className="surface p-4 sm:p-6" aria-labelledby="delivery-title">
          <h2 id="delivery-title" className="text-lg font-semibold text-zinc-50">Endereço de entrega</h2>
          <dl className="mt-4 space-y-2 text-sm text-zinc-200">
            <div><dt className="sr-only">Logradouro e número</dt><dd>{order.deliveryAddress.logradouro}, {order.deliveryAddress.numero}</dd></div>
            {order.deliveryAddress.complemento ? <div><dt className="sr-only">Complemento</dt><dd>{order.deliveryAddress.complemento}</dd></div> : null}
            <div><dt className="sr-only">Bairro</dt><dd>{order.deliveryAddress.bairro}</dd></div>
            <div><dt className="sr-only">Cidade e estado</dt><dd>{order.deliveryAddress.cidade} - {order.deliveryAddress.uf}</dd></div>
            <div><dt className="sr-only">CEP</dt><dd>CEP {order.deliveryAddress.cep}</dd></div>
          </dl>
        </section>
      </div>

      <section className="surface mt-6 p-4 sm:p-6" aria-labelledby="items-title">
        <h2 id="items-title" className="text-lg font-semibold text-zinc-50">Itens confirmados</h2>
        <ul className="mt-4 divide-y divide-zinc-800">
          {order.items.map((item) => (
            <li key={item.itemId} className="py-4">
              <OrderItem
                item={item}
                productResult={productsById.get(item.productId) ?? (productsQuery.isPending ? {
                  status: 'pending',
                  productId: item.productId,
                } : {
                  status: 'error',
                  productId: item.productId,
                  error: productsQuery.error,
                })}
              />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-700 pt-4 text-lg font-bold text-zinc-50"><span>Total</span><span>{currency.format(calculateOrderTotal(order.items))}</span></div>
      </section>
    </section>
  )
}
