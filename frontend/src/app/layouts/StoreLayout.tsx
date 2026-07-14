import { useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { useLogoutMutation } from '../../features/auth/mutations/useLogoutMutation'
import { useAuthStore } from '../../features/auth/store/authStore'
import { parseCatalogUrl, serializeCatalogUrl } from '../../features/catalog/routing/catalogUrl'
import { Footer } from './Footer'
import { Header } from './Header'

export function StoreLayout() {
  const session = useAuthStore((state) => state.session)
  const logoutMutation = useLogoutMutation()
  const [searchParams, setSearchParams] = useSearchParams()
  const catalogUrl = parseCatalogUrl(searchParams)

  return (
    <div className="flex min-h-dvh flex-col" data-shell="store">
      <CatalogHeader
        key={searchParams.toString()}
        initialSearchword={catalogUrl.searchword ?? ''}
        categoriaId={catalogUrl.categoriaId}
        customer={session ? { name: 'Cliente', email: session.email } : null}
        onSignOut={session ? () => logoutMutation.mutate(session.token) : undefined}
        setSearchParams={setSearchParams}
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
  customer: React.ComponentProps<typeof Header>['customer']
  onSignOut: React.ComponentProps<typeof Header>['onSignOut']
  setSearchParams: ReturnType<typeof useSearchParams>[1]
}

function CatalogHeader({
  initialSearchword,
  categoriaId,
  customer,
  onSignOut,
  setSearchParams,
}: CatalogHeaderProps) {
  const [searchword, setSearchword] = useState(initialSearchword)

  function handleSearchSubmit() {
    setSearchParams(
      serializeCatalogUrl({ searchword, categoriaId, page: 1 }),
      { replace: false },
    )
  }

  return (
    <Header
      customer={customer}
      onSignOut={onSignOut}
      searchword={searchword}
      onSearchwordChange={setSearchword}
      onSearchSubmit={handleSearchSubmit}
    />
  )
}
