import { Link } from 'react-router-dom'

import { Badge } from '../../../shared/ui/indicators/Badge'
import { Card } from '../../../shared/ui/surfaces/Card'
import type { Order } from '../contracts/orders'
import {
  calculateOrderTotal,
  getOrderStatusLabel,
} from '../formatting/orderPresentation'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

export interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const titleId = `order-${order.id}-title`
  const statusLabel = getOrderStatusLabel(order.status)

  return (
    <Card
      aria-labelledby={titleId}
      className="flex min-w-0 flex-col gap-5 p-4 sm:p-5"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id={titleId} className="break-words text-lg font-semibold text-zinc-100">
          Pedido {order.id}
        </h2>
        <Badge className="self-start" status="neutral">
          {statusLabel}
        </Badge>
      </div>

      <dl className="grid min-w-0 gap-4 sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-sm text-zinc-400">Data</dt>
          <dd className="mt-1 break-words font-medium text-zinc-100">
            {dateFormatter.format(new Date(order.createdAt))}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm text-zinc-400">Forma de pagamento</dt>
          <dd className="mt-1 break-words font-medium text-zinc-100">
            {order.paymentMethod}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm text-zinc-400">Valor total</dt>
          <dd className="mt-1 break-words text-lg font-semibold text-zinc-50">
            {brlFormatter.format(calculateOrderTotal(order.items))}
          </dd>
        </div>
      </dl>

      <Link
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-brand-500/40 px-4 py-2 font-semibold text-brand-300 transition-colors hover:bg-brand-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:ml-auto sm:w-auto"
        to={`/pedidos/${order.id}`}
      >
        Ver pedido {order.id}
      </Link>
    </Card>
  )
}
