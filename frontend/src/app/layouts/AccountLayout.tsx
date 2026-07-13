import { Outlet } from 'react-router-dom'

export function AccountLayout() {
  return (
    <section aria-label="Minha conta" data-shell="account">
      <Outlet />
    </section>
  )
}
