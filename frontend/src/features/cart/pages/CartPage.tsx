import { Button } from '../../../shared/ui/buttons/Button'
import { LinkButton } from '../../../shared/ui/buttons/LinkButton'
import { EmptyState } from '../../../shared/ui/states/EmptyState'
import { ErrorState } from '../../../shared/ui/states/ErrorState'
import { Skeleton } from '../../../shared/ui/states/Skeleton'
import { Card } from '../../../shared/ui/surfaces/Card'
import { CartItem } from '../components/CartItem'
import type { CartItem as CartItemContract } from '../contracts/cart'
import { useCartProductsQuery, type CartProductResult } from '../queries/useCartProductsQuery'
import { useCartQuery } from '../queries/useCartQuery'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const unavailableProduct = (productId: number): CartProductResult => ({
  status: 'error',
  productId,
  error: new Error('Product details are unavailable'),
})

function CartLoadingState() {
  return (
    <div aria-live="polite" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]" role="status">
      <span className="sr-only">Carregando carrinho</span>
      <div className="space-y-4">
        {Array.from({ length: 2 }, (_, index) => (
          <Card className="grid gap-4 p-4 sm:grid-cols-[8rem_minmax(0,1fr)]" data-testid="cart-item-skeleton" key={index}>
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" shape="text" />
              <Skeleton className="w-full" shape="text" />
              <Skeleton className="w-2/3" shape="text" />
            </div>
          </Card>
        ))}
      </div>
      <Skeleton className="h-44 w-full" />
    </div>
  )
}

function CartEmptyState() {
  return (
    <EmptyState
      title="Seu carrinho está vazio"
      description="Explore o catálogo para encontrar produtos."
      action={<LinkButton to="/">Explorar catálogo</LinkButton>}
    />
  )
}

function CartSummary({ items }: { items: readonly CartItemContract[] }) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  return (
    <aside aria-label="Resumo do carrinho" className="lg:sticky lg:top-28 lg:self-start">
      <Card className="p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-zinc-100">Resumo</h2>
        <dl className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-4 text-zinc-300">
            <dt>Subtotal</dt>
            <dd>{brlFormatter.format(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-ink-700 pt-4 text-lg font-semibold text-zinc-50">
            <dt>Total</dt>
            <dd>{brlFormatter.format(subtotal)}</dd>
          </div>
        </dl>
      </Card>
    </aside>
  )
}

export function CartPage() {
  const cartQuery = useCartQuery()
  const items = cartQuery.data?.items ?? []
  const productsQuery = useCartProductsQuery(items)

  let content

  if (!cartQuery.hasCart) {
    content = <CartEmptyState />
  } else if ((cartQuery.isPending && !cartQuery.data) || (productsQuery.isPending && !productsQuery.data)) {
    content = <CartLoadingState />
  } else if (cartQuery.isError && !cartQuery.data) {
    content = (
      <ErrorState
        title="Não foi possível carregar o carrinho"
        action={<Button onClick={() => void cartQuery.refetch()}>Tentar novamente</Button>}
      />
    )
  } else if (items.length === 0) {
    content = <CartEmptyState />
  } else {
    const productsById = new Map(
      (productsQuery.data ?? []).map((result) => [result.productId, result]),
    )

    content = (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <ul aria-label="Itens do carrinho" className="space-y-4">
          {items.map((item) => {
            const productResult = productsById.get(item.productId)
              ?? unavailableProduct(item.productId)

            return (
              <li key={item.id}>
                <CartItem
                  actions={null}
                  fallbackAction={(
                    <Button
                      aria-label={`Tentar carregar Produto ${item.productId} novamente`}
                      onClick={() => void productsQuery.refetch()}
                      size="sm"
                      variant="secondary"
                    >
                      Tentar novamente
                    </Button>
                  )}
                  item={item}
                  productResult={productResult}
                  quantityControl={null}
                />
              </li>
            )
          })}
        </ul>
        <CartSummary items={items} />
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-10 lg:py-12">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">Carrinho</h1>
        <p className="mt-2 text-zinc-400">Revise os itens confirmados antes de continuar.</p>
      </header>
      {content}
    </div>
  )
}
