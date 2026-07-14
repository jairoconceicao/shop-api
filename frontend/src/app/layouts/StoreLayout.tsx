import { useState } from 'react'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { useLogoutMutation } from '../../features/auth/mutations/useLogoutMutation'
import { useAuthStore } from '../../features/auth/store/authStore'
import { parseCatalogUrl, serializeCatalogUrl } from '../../features/catalog/routing/catalogUrl'
import { parseCategoryId } from '../../features/catalog/routing/catalogUrl'
import { useCategoriesQuery } from '../../features/catalog/queries/useCategoriesQuery'
import { useConfirmedCartCount } from '../../features/cart/hooks/useConfirmedCartCount'
import { Footer } from './Footer'
import { Header } from './Header'

export function StoreLayout() {
  const session = useAuthStore((state) => state.session)
  const logoutMutation = useLogoutMutation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const catalogUrl = parseCatalogUrl(searchParams)
  const categoriesQuery = useCategoriesQuery()
  const selectedCategoryId = parseCategoryId(catalogUrl.categoriaId)
  const cartCount = useConfirmedCartCount()

  return (
    <div className="flex min-h-dvh flex-col" data-shell="store">
      <CatalogHeader
        key={searchParams.toString()}
        initialSearchword={catalogUrl.searchword ?? ''}
        categoriaId={selectedCategoryId === undefined ? undefined : String(selectedCategoryId)}
        categories={categoriesQuery.data}
        selectedCategoryId={selectedCategoryId}
        customer={session ? { name: 'Cliente', email: session.email } : null}
        onSignOut={session ? () => logoutMutation.mutate(session.token) : undefined}
        cartCount={cartCount}
        navigate={navigate}
      />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

interface CatalogHeaderProps {
  initialSearchword: string
  categoriaId?: string
  categories?: React.ComponentProps<typeof Header>['categories']
  selectedCategoryId?: number
  customer: React.ComponentProps<typeof Header>['customer']
  onSignOut: React.ComponentProps<typeof Header>['onSignOut']
  cartCount: React.ComponentProps<typeof Header>['cartCount']
  navigate: ReturnType<typeof useNavigate>
}

function CatalogHeader({
  initialSearchword,
  categoriaId,
  categories,
  selectedCategoryId,
  customer,
  onSignOut,
  cartCount,
  navigate,
}: CatalogHeaderProps) {
  const [searchword, setSearchword] = useState(initialSearchword)

  function handleSearchSubmit() {
    const search = serializeCatalogUrl({ searchword, categoriaId, page: 1 }).toString()
    navigate({ pathname: '/', search: search ? `?${search}` : '' }, { replace: false })
  }

  return (
    <Header
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      customer={customer}
      onSignOut={onSignOut}
      cartCount={cartCount}
      searchword={searchword}
      onSearchwordChange={setSearchword}
      onSearchSubmit={handleSearchSubmit}
    />
  )
}
