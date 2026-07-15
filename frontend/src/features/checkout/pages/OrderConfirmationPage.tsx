import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { LinkButton } from '../../../shared/ui/buttons/LinkButton'
import { EmptyState } from '../../../shared/ui/states/EmptyState'
import { Card } from '../../../shared/ui/surfaces/Card'
import { useAuthStore } from '../../auth/store/authStore'
import { getOrderConfirmation } from '../cache/orderConfirmationCache'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

function parseOrderId(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return undefined
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}

export function OrderConfirmationPage() {
  const { pedidoId } = useParams()
  const queryClient = useQueryClient()
  const customerId = useAuthStore((state) => state.session?.clienteId)
  const orderId = parseOrderId(pedidoId)
  const order = orderId && Number.isSafeInteger(customerId) && customerId && customerId > 0
    ? getOrderConfirmation(queryClient, customerId, orderId)
    : undefined

  if (!order) {
    return (
      <main className="container-page py-8 sm:py-10 lg:py-12">
        <h1 className="sr-only">Confirmação do pedido</h1>
        <EmptyState
          title="Confirmação indisponível"
          description="Não foi possível recuperar os dados desta confirmação."
          action={<LinkButton to="/">Voltar à loja</LinkButton>}
        />
      </main>
    )
  }

  return (
    <main className="container-page py-8 sm:py-10 lg:py-12">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">Pedido criado</h1>
        <p className="mt-3 text-zinc-400">Os dados confirmados do pedido estão abaixo.</p>
      </header>

      <Card className="mx-auto mt-8 max-w-3xl p-5 sm:p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div><dt className="text-sm text-zinc-400">Pedido</dt><dd className="mt-1 font-semibold text-zinc-100">{order.id}</dd></div>
          <div><dt className="text-sm text-zinc-400">Status</dt><dd className="mt-1 font-semibold text-zinc-100">{order.status}</dd></div>
          <div><dt className="text-sm text-zinc-400">Data</dt><dd className="mt-1 font-semibold text-zinc-100">{dateFormatter.format(new Date(order.createdAt))}</dd></div>
          <div><dt className="text-sm text-zinc-400">Forma de pagamento</dt><dd className="mt-1 font-semibold text-zinc-100">{order.paymentMethod}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-zinc-400">Valor total</dt><dd className="mt-1 text-xl font-semibold text-zinc-50">{brlFormatter.format(order.total)}</dd></div>
        </dl>
        <div className="mt-7"><LinkButton to="/">Voltar à loja</LinkButton></div>
      </Card>
    </main>
  )
}
