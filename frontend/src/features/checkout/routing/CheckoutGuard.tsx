import { Navigate, Outlet } from 'react-router-dom'

import { useCartQuery } from '../../cart/queries/useCartQuery'
import { ErrorState } from '../../../shared/ui/states/ErrorState'
import { Skeleton } from '../../../shared/ui/states/Skeleton'

function CheckoutGuardSkeleton() {
  return (
    <div role="status" className="space-y-4" aria-label="Carregando carrinho">
      <span className="sr-only">Carregando carrinho</span>
      <Skeleton className="h-10 w-2/5" shape="text" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export function CheckoutGuard() {
  const { data, hasCart, isError, isPending } = useCartQuery()

  if (!hasCart) return <Navigate replace to="/carrinho" />

  if (isPending) return <CheckoutGuardSkeleton />

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o carrinho"
        description="Tente novamente em alguns instantes antes de continuar para o checkout."
      />
    )
  }

  if (!data || data.items.length === 0) return <Navigate replace to="/carrinho" />

  return <Outlet />
}
