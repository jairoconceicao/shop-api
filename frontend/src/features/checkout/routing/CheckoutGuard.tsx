import { Navigate, Outlet } from 'react-router-dom'

import { Button } from '../../../shared/ui/buttons/Button'
import { ErrorState } from '../../../shared/ui/states/ErrorState'
import { Skeleton } from '../../../shared/ui/states/Skeleton'
import { useCartQuery } from '../../cart/queries/useCartQuery'
import { useCheckoutProfileQuery } from '../queries/useCheckoutProfileQuery'

function CheckoutGuardSkeleton() {
  return (
    <div role="status" className="space-y-4" aria-label="Carregando carrinho">
      <span className="sr-only">Carregando carrinho</span>
      <Skeleton className="h-10 w-2/5" shape="text" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

function CheckoutProfileSkeleton() {
  return (
    <div role="status" className="space-y-4" aria-label="Carregando endereço de entrega">
      <span className="sr-only">Carregando endereço de entrega</span>
      <Skeleton className="h-10 w-2/5" shape="text" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export function CheckoutGuard() {
  const { data, hasCart, isError, isPending } = useCartQuery()
  const hasConfirmedCart = hasCart && !isPending && !isError && Boolean(data?.items.length)
  const profileQuery = useCheckoutProfileQuery(hasConfirmedCart)

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

  if (profileQuery.isPending) return <CheckoutProfileSkeleton />

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="Não foi possível carregar o endereço"
        description="Tente novamente para carregar o endereço de entrega antes de continuar."
        action={<Button onClick={() => void profileQuery.refetch()}>Tentar novamente</Button>}
      />
    )
  }

  return <Outlet context={{ cart: data, profile: profileQuery.data }} />
}
