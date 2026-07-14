import { useEffect, useReducer } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../../shared/ui/buttons/Button'
import { LinkButton } from '../../../shared/ui/buttons/LinkButton'
import { QuantityInput } from '../../../shared/ui/forms/QuantityInput'
import { InlineAlert } from '../../../shared/ui/feedback/InlineAlert'
import { ProductImage } from '../../../shared/ui/media/ProductImage'
import { ErrorState } from '../../../shared/ui/states/ErrorState'
import { Skeleton } from '../../../shared/ui/states/Skeleton'
import { isAuthSessionExpired, useAuthStore } from '../../auth/store/authStore'
import { useAddProductToCart } from '../../cart/hooks/useAddProductToCart'
import type { ProductDetail } from '../contracts/catalog'
import { isProductNotFoundError, useProductDetailQuery } from '../queries/useProductDetailQuery'
import { parseProductId } from '../routing/productId'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function ProductNotFound() {
  return (
    <section className="container-page py-10 sm:py-14">
      <div className="surface flex flex-col items-center px-6 py-10 text-center">
        <h1 className="text-2xl font-bold text-zinc-50">Produto não encontrado</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          O produto informado não existe ou não está mais disponível.
        </p>
        <div className="mt-6"><LinkButton to="/">Voltar ao catálogo</LinkButton></div>
      </div>
    </section>
  )
}

function ProductDetailSkeleton() {
  return (
    <section className="container-page py-10 sm:py-14" data-testid="product-detail-skeleton">
      <div className="grid gap-8 lg:grid-cols-2" data-testid="product-detail-skeleton-grid">
        <Skeleton className="aspect-square w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="w-1/3" shape="text" />
          <Skeleton className="h-10 w-4/5" shape="text" />
          <Skeleton className="w-1/2" shape="text" />
          <Skeleton className="h-9 w-2/5" shape="text" />
          <Skeleton className="w-1/3" shape="text" />
        </div>
      </div>
      <div className="mt-10 space-y-3">
        <Skeleton className="h-7 w-1/4" shape="text" />
        <Skeleton className="w-full" shape="text" />
        <Skeleton className="w-3/4" shape="text" />
      </div>
    </section>
  )
}

function ProductPurchaseControls({ product, availableStock }: {
  product: ProductDetail
  availableStock: number
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const isSoldOut = availableStock < 1
  const maximumQuantity = Math.max(1, availableStock)
  const addToCart = useAddProductToCart()
  const [quantity, updateQuantity] = useReducer(
    (currentQuantity: number, requestedQuantity: number) =>
      Math.min(requestedQuantity, maximumQuantity),
    1,
  )

  useEffect(() => {
    updateQuantity(quantity)
  }, [maximumQuantity, quantity])

  function handleAddToCart() {
    const session = useAuthStore.getState().session

    if (!session || isAuthSessionExpired(session)) {
      const returnTo = `${location.pathname}${location.search}${location.hash}`
      void navigate('/entrar', { replace: true, state: { returnTo } })
      return
    }

    void addToCart.addProduct({
      session,
      productId: product.id,
      quantity,
      displayedUnitPrice: product.price,
    })
  }

  return (
    <div className="mt-6 flex flex-col items-start gap-4">
      <QuantityInput
        label="Quantidade"
        value={quantity}
        min={1}
        max={maximumQuantity}
        disabled={isSoldOut || addToCart.isPending}
        onChange={updateQuantity}
      />
      <Button
        aria-busy={addToCart.isPending}
        disabled={isSoldOut || addToCart.isPending}
        onClick={handleAddToCart}
      >
        {addToCart.isPending ? 'Adicionando…' : 'Adicionar ao carrinho'}
      </Button>
      {addToCart.error ? (
        <InlineAlert
          title="Não foi possível adicionar o produto"
          variant="error"
          action={<Button variant="secondary" onClick={handleAddToCart}>Tentar novamente</Button>}
        >
          {addToCart.error.message}
        </InlineAlert>
      ) : null}
      {addToCart.isSuccess ? (
        <InlineAlert title="Produto adicionado ao carrinho" variant="success" />
      ) : null}
    </div>
  )
}

function ProductContent({ product }: { product: ProductDetail }) {
  const availableStock = Number.isFinite(product.stock)
    ? Math.max(0, Math.floor(product.stock))
    : 0
  const isSoldOut = availableStock < 1

  const stockLabel = isSoldOut
    ? 'Esgotado'
    : availableStock === 1
      ? '1 unidade em estoque'
      : `${availableStock} unidades em estoque`

  return (
    <section className="container-page py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12" data-testid="product-detail-grid">
        <ProductImage alt={product.title} loading="eager" src={product.photo} />
        <div className="min-w-0 self-center">
          <p className="text-sm font-semibold text-brand-400">{product.category.title}</p>
          <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            {product.title}
          </h1>
          <dl className="mt-6 space-y-4 text-zinc-300">
            <div><dt className="text-sm text-zinc-500">Modelo</dt><dd className="mt-1">{product.model ?? 'Não informado'}</dd></div>
            <div><dt className="sr-only">Preço</dt><dd className="text-3xl font-bold text-zinc-50">{brlFormatter.format(product.price)}</dd></div>
            <div><dt className="sr-only">Estoque</dt><dd>{stockLabel}</dd></div>
          </dl>
          <ProductPurchaseControls product={product} availableStock={availableStock} />
        </div>
      </div>
      <div className="mt-10 border-t border-ink-700 pt-8" data-testid="product-description">
        <h2 className="text-2xl font-bold text-zinc-50">Descrição</h2>
        <p className="mt-3 whitespace-pre-line leading-7 text-zinc-300">
          {product.description ?? 'Descrição não disponível.'}
        </p>
      </div>
    </section>
  )
}

export function ProductDetailPage() {
  const { produtoId } = useParams<{ produtoId: string }>()
  const productId = parseProductId(produtoId)
  const query = useProductDetailQuery(produtoId)

  if (productId === undefined) return <ProductNotFound />
  if (query.isPending && !query.data) return <ProductDetailSkeleton />
  if (isProductNotFoundError(query.error)) return <ProductNotFound />

  if (query.isError && !query.data) {
    return (
      <section className="container-page py-10 sm:py-14">
        <ErrorState action={<Button onClick={() => void query.refetch()}>Tentar novamente</Button>} />
      </section>
    )
  }

  return query.data ? <ProductContent key={query.data.id} product={query.data} /> : null
}
