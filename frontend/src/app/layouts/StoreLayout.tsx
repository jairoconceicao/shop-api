import { Outlet } from 'react-router-dom'

export function StoreLayout() {
  return (
    <main data-shell="store">
      <Outlet />
    </main>
  )
}
