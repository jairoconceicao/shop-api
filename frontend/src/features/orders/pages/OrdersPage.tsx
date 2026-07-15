import { useSearchParams } from 'react-router-dom'

import { Button } from '../../../shared/ui/buttons/Button'
import { Pagination } from '../../../shared/ui/navigation/Pagination'
import { EmptyState } from '../../../shared/ui/states/EmptyState'
import { ErrorState } from '../../../shared/ui/states/ErrorState'
import { Skeleton } from '../../../shared/ui/states/Skeleton'
import { OrderCard } from '../components/OrderCard'
import { OrdersPeriodFilter } from '../components/OrdersPeriodFilter'
import { useOrdersQuery } from '../queries/useOrdersQuery'
import { parseOrdersUrl, serializeOrdersUrl, toOrdersApiPeriod } from '../routing/ordersUrl'

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlState = parseOrdersUrl(searchParams)
  const period = toOrdersApiPeriod(urlState)
  const query = useOrdersQuery({ ...period, page: urlState.page })
  const hasPeriod = Boolean(urlState.startDate || urlState.endDate)

  function clearPeriod() {
    setSearchParams(serializeOrdersUrl({ page: 1 }))
  }

  function changePage(page: number) {
    setSearchParams(serializeOrdersUrl({ ...urlState, page }))
  }

  let content
  if (query.isPending) {
    content = (
      <div role="status" aria-label="Carregando pedidos" aria-live="polite" className="min-h-96 space-y-4">
        <span className="sr-only">Carregando pedidos…</span>
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-44 w-full" />)}
      </div>
    )
  } else if (query.isError) {
    content = <ErrorState title="Não foi possível carregar seus pedidos" action={<Button onClick={() => void query.refetch()}>Tentar novamente</Button>} />
  } else if (query.data.orders.length === 0) {
    content = (
      <EmptyState
        title="Nenhum pedido encontrado"
        description={hasPeriod ? 'Não encontramos pedidos no período selecionado.' : 'Você ainda não possui pedidos.'}
        action={hasPeriod ? <Button variant="secondary" onClick={clearPeriod}>Limpar período</Button> : undefined}
      />
    )
  } else {
    content = (
      <>
        <div className="space-y-4">{query.data.orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
        {query.data.pages > 1 ? <div className="mt-8"><Pagination page={urlState.page} totalPages={query.data.pages} onPageChange={changePage} ariaLabel="Paginação de pedidos" /></div> : null}
      </>
    )
  }

  return (
    <section className="container-page py-8 sm:py-10" aria-labelledby="orders-title">
      <div className="mb-6">
        <h1 id="orders-title" className="text-2xl font-bold text-zinc-50 sm:text-3xl">Meus pedidos</h1>
        <p className="mt-2 text-sm text-zinc-400">Acompanhe seus pedidos e consulte compras anteriores.</p>
      </div>
      <div className="surface mb-6 p-4 sm:p-6"><OrdersPeriodFilter /></div>
      <div aria-live="polite">{content}</div>
    </section>
  )
}
