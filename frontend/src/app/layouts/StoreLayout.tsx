import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function StoreLayout() {
  return (
    <div data-shell="store">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
