import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <main data-shell="public">
      <Outlet />
    </main>
  )
}
