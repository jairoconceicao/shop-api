import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function StoreLayout() {
  return (
    <div data-shell="store">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
