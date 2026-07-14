import { Outlet } from 'react-router-dom'
import { useLogoutMutation } from '../../features/auth/mutations/useLogoutMutation'
import { useAuthStore } from '../../features/auth/store/authStore'
import { Footer } from './Footer'
import { Header } from './Header'

export function StoreLayout() {
  const session = useAuthStore((state) => state.session)
  const logoutMutation = useLogoutMutation()

  return (
    <div className="flex min-h-dvh flex-col" data-shell="store">
      <Header
        customer={session ? { name: 'Cliente', email: session.email } : null}
        onSignOut={session ? () => logoutMutation.mutate(session.token) : undefined}
      />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
