import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function StoreLayout() {
  return (
    <div className="flex min-h-dvh flex-col" data-shell="store">
      <Header />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
