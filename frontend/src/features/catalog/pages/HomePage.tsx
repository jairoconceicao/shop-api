import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '../../../shared/ui/buttons/Button'
import { LinkButton } from '../../../shared/ui/buttons/LinkButton'
import { Pagination } from '../../../shared/ui/navigation/Pagination'
import { EmptyState } from '../../../shared/ui/states/EmptyState'
import { ErrorState } from '../../../shared/ui/states/ErrorState'
import { Skeleton } from '../../../shared/ui/states/Skeleton'
import { Card } from '../../../shared/ui/surfaces/Card'
import { ProductCard } from '../components/ProductCard'
import type { CatalogPage, CatalogProduct } from '../contracts/catalog'
import { useCatalogQuery } from '../queries/useCatalogQuery'
import { useCategoriesQuery } from '../queries/useCategoriesQuery'
import { useProductsByCategoryQuery } from '../queries/useProductsByCategoryQuery'
import { parseCatalogUrl, parseCategoryId, serializeCatalogUrl } from '../routing/catalogUrl'

function GeneralCatalog({ page, searchword }: { page: number; searchword?: string }) {
  const navigate = useNavigate()
  const query = useCatalogQuery({
    page,
    size: 20,
    ...(searchword ? { searchword } : {}),
  })

  function handlePageChange(nextPage: number) {
    const search = serializeCatalogUrl({ page: nextPage, ...(searchword ? { searchword } : {}) })
    void navigate({ pathname: '/', search: search.size > 0 ? `?${search.toString()}` : '' })
  }

  return <CatalogContent {...query} page={page} onPageChange={handlePageChange} paginated />
}

function CategoryCatalog({ categoryId }: { categoryId: number }) {
  const query = useProductsByCategoryQuery(categoryId)
  return <CatalogContent {...query} />
}

interface CatalogContentProps {
  data?: CatalogPage
  isError: boolean
  isPending: boolean
  refetch: () => unknown
  paginated?: boolean
  page?: number
  onPageChange?: (page: number) => void
}

function CatalogContent({
  data,
  isError,
  isPending,
  refetch,
  paginated = false,
  page = 1,
  onPageChange,
}: CatalogContentProps) {
  if (isPending && !data) return <CatalogSkeletonGrid />

  if (isError && !data) {
    return (
      <ErrorState
        className="mt-8"
        action={<Button onClick={() => void refetch()}>Tentar novamente</Button>}
      />
    )
  }

  if (!data || data.products.length === 0) {
    return (
      <EmptyState
        className="mt-8"
        title="Nenhum produto encontrado"
        description="Altere os filtros ou volte ao catálogo completo."
        action={<LinkButton to="/">Limpar filtros</LinkButton>}
      />
    )
  }

  const { pages, size, totalItems } = data.pagination

  return (
    <>
      {paginated ? <p className="mt-8 text-sm text-zinc-400">{totalItems} produtos · {size} por página</p> : null}
      <CatalogGrid products={data.products} />
      {paginated && pages > 1 && onPageChange ? (
        <div className="mt-8">
          <Pagination
            ariaLabel="Paginação do catálogo"
            page={page}
            totalPages={pages}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </>
  )
}

function CatalogGrid({ products }: { products: readonly CatalogProduct[] }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="catalog-grid">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}

function CatalogSkeletonGrid() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="catalog-skeleton-grid">
      {Array.from({ length: 8 }, (_, index) => (
        <Card className="flex min-w-0 flex-col gap-4 p-4" data-testid="product-card-skeleton" key={index}>
          <Skeleton className="aspect-square w-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Skeleton className="w-2/5" shape="text" />
            <Skeleton className="h-6 w-4/5" shape="text" />
            <Skeleton className="h-7 w-1/2" shape="text" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="mt-auto h-11 w-full" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function HomePage() {
  const [searchParams] = useSearchParams()
  const catalogUrl = parseCatalogUrl(searchParams)
  const categoryId = parseCategoryId(catalogUrl.categoriaId)
  useCategoriesQuery()

  return (
    <>
      <section className="border-b border-ink-700/70 bg-ink-900">
        <div className="container-page py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-brand-400">Shop Api</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
              Encontre produtos para o seu dia a dia
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Navegue pelo catálogo e encontre o que você procura.
            </p>
            <a
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-500 px-5 py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-400"
              href="#catalogo"
            >
              Explorar catálogo
            </a>
          </div>
        </div>
      </section>

      <section className="container-page scroll-mt-32 py-10 sm:py-14" id="catalogo">
        <header>
          <h2 className="text-2xl font-bold text-zinc-50 sm:text-3xl">Catálogo</h2>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Explore os produtos disponíveis por categoria.
          </p>
        </header>
        {categoryId === undefined ? (
          <GeneralCatalog page={catalogUrl.page} searchword={catalogUrl.searchword} />
        ) : (
          <CategoryCatalog categoryId={categoryId} />
        )}
      </section>
    </>
  )
}
