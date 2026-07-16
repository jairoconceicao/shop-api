import { useRef, useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'

import { formatCurrency } from '../../../shared/formatting/currency'
import { Button } from '../../../shared/ui/buttons/Button'
import { getButtonClasses } from '../../../shared/ui/buttons/buttonStyles'
import { LinkButton } from '../../../shared/ui/buttons/LinkButton'
import { InlineAlert } from '../../../shared/ui/feedback/InlineAlert'
import { QuantityInput } from '../../../shared/ui/forms/QuantityInput'
import { EmptyState } from '../../../shared/ui/states/EmptyState'
import { ErrorState } from '../../../shared/ui/states/ErrorState'
import { Skeleton } from '../../../shared/ui/states/Skeleton'
import { Card } from '../../../shared/ui/surfaces/Card'
import { Dialog } from '../../../shared/ui/overlays/Dialog'
import { useAuthStore } from '../../auth/store/authStore'
import { CartItem } from '../components/CartItem'
import type { CartItem as CartItemContract } from '../contracts/cart'
import { useCartProductsQuery, type CartProductResult } from '../queries/useCartProductsQuery'
import { useCartQuery } from '../queries/useCartQuery'
import { useUpdateCartItemMutation } from '../mutations/useUpdateCartItemMutation'
import { useDeleteCartItemMutation } from '../mutations/useDeleteCartItemMutation'
import { cartCache } from '../cache/cartCache'

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
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-ink-700 pt-4 text-lg font-semibold text-zinc-50">
            <dt>Total</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LinkButton className="w-full" to="/" variant="secondary">
            Continuar comprando
          </LinkButton>
          <LinkButton className="w-full" to="/checkout">
            Ir para checkout
          </LinkButton>
        </div>
      </Card>
    </aside>
  )
}

function CartItemQuantityControl({
  cartId,
  customerId,
  item,
  max,
  title,
  token,
}: {
  cartId: number
  customerId: number
  item: CartItemContract
  max: number
  title: string
  token: string
}) {
  const mutation = useUpdateCartItemMutation({ customerId, cartId, itemId: item.id, token })
  const isDeleting = useIsMutating({
    mutationKey: cartCache.mutation.delete(customerId, cartId, item.id), exact: true,
  }) > 0
  const retryQuantity = mutation.variables ?? item.quantity

  return (
    <div className="space-y-3">
      <QuantityInput
        disabled={mutation.isPending || isDeleting}
        label={`Quantidade de ${title}`}
        max={Math.max(1, Math.floor(max))}
        onChange={(quantity) => {
          mutation.reset()
          mutation.mutate(quantity)
        }}
        value={item.quantity}
      />
      {mutation.isError ? (
        <InlineAlert
          title="Não foi possível atualizar a quantidade"
          variant="error"
          action={(
            <Button
              aria-label="Tentar atualizar quantidade novamente"
              onClick={() => mutation.mutate(retryQuantity)}
              size="sm"
              variant="secondary"
            >
              Tentar novamente
            </Button>
          )}
        />
      ) : null}
      {mutation.isSuccess ? <InlineAlert title="Quantidade atualizada" variant="success" /> : null}
    </div>
  )
}

function RemoveItemButton({ cartId, customerId, itemId, label, onClick }: {
  cartId: number; customerId: number; itemId: number; label: string; onClick: () => void
}) {
  const isUpdating = useIsMutating({
    mutationKey: cartCache.mutation.update(customerId, cartId, itemId), exact: true,
  }) > 0
  return (
    <Button aria-label={label} disabled={isUpdating} onClick={onClick} size="sm" variant="secondary">
      Remover
    </Button>
  )
}

export function CartPage() {
  const token = useAuthStore((state) => state.session?.token)
  const cartQuery = useCartQuery()
  const items = cartQuery.data?.items ?? []
  const productsQuery = useCartProductsQuery(items)
  const [selectedItem, setSelectedItem] = useState<{ id: number; title: string } | null>(null)
  const [removalAnnouncement, setRemovalAnnouncement] = useState('')
  const cancelRemovalRef = useRef<HTMLButtonElement>(null)
  const pageTitleRef = useRef<HTMLHeadingElement>(null)
  const submittingRemovalRef = useRef(false)
  const deleteMutation = useDeleteCartItemMutation({
    customerId: cartQuery.data?.customerId ?? 0,
    cartId: cartQuery.data?.id ?? 0,
    itemId: selectedItem?.id ?? 0,
    token: token ?? '',
  })

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
            const quantityControl = productResult.status === 'success'
              && productResult.product.stock >= 1
              && token ? (
              <CartItemQuantityControl
                cartId={cartQuery.data!.id}
                customerId={cartQuery.data!.customerId}
                item={item}
                max={productResult.product.stock}
                title={productResult.product.title}
                token={token}
              />
            ) : null

            return (
              <li key={item.id}>
                <CartItem
                  actions={token ? (
                    <RemoveItemButton
                      cartId={cartQuery.data!.id}
                      customerId={cartQuery.data!.customerId}
                      itemId={item.id}
                      label={`Remover ${productResult.status === 'success' ? productResult.product.title : `Produto ${item.productId}`}`}
                      onClick={() => {
                        deleteMutation.reset()
                        setRemovalAnnouncement('')
                        setSelectedItem({
                          id: item.id,
                          title: productResult.status === 'success' ? productResult.product.title : `Produto ${item.productId}`,
                        })
                      }}
                    />
                  ) : null}
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
                  quantityControl={quantityControl}
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
        <h1 ref={pageTitleRef} className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl" tabIndex={-1}>Carrinho</h1>
        <p className="mt-2 text-zinc-400">Revise os itens confirmados antes de continuar.</p>
      </header>
      {content}
      <span aria-live="polite" className="sr-only">{removalAnnouncement}</span>
      <Dialog
        description={selectedItem ? `Você deseja remover ${selectedItem.title}? Esta ação pode ser tentada novamente se falhar.` : undefined}
        initialFocusRef={cancelRemovalRef}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setSelectedItem(null)
        }}
        open={selectedItem !== null}
        title="Remover item do carrinho?"
      >
        {deleteMutation.isError ? (
          <InlineAlert title="Não foi possível remover o item" variant="error" />
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRemovalRef}
            type="button"
            className={getButtonClasses({ variant: 'secondary', size: 'md' })}
            disabled={deleteMutation.isPending}
            onClick={() => setSelectedItem(null)}
          >
            Cancelar
          </button>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (!selectedItem || deleteMutation.isPending || submittingRemovalRef.current) return
              submittingRemovalRef.current = true
              const title = selectedItem.title
              deleteMutation.mutate(undefined, {
                onError: () => {
                  submittingRemovalRef.current = false
                },
                onSuccess: () => {
                  submittingRemovalRef.current = false
                  setRemovalAnnouncement(`${title} removido do carrinho`)
                  setSelectedItem(null)
                  requestAnimationFrame(() => pageTitleRef.current?.focus())
                },
              })
            }}
            variant="danger"
          >
            {deleteMutation.isPending
              ? 'Removendo…'
              : deleteMutation.isError
                ? 'Tentar remover novamente'
                : 'Remover item'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
