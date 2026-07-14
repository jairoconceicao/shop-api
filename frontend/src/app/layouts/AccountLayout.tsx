import { NavLink, Outlet } from 'react-router-dom'

const accountNavigation = [
  { label: 'Meus dados', to: '/minha-conta/dados' },
  { label: 'Trocar senha', to: '/minha-conta/senha' },
  { label: 'Meus pedidos', to: '/pedidos' },
] as const

const navigationLinkClasses =
  'inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors'

export function AccountLayout() {
  return (
    <section
      aria-label="Minha conta"
      className="container-page max-w-3xl py-8 sm:py-10"
      data-shell="account"
    >
      <nav aria-label="Navegação da conta" className="mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
          {accountNavigation.map((item) => (
            <li key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  `${navigationLinkClasses} ${
                    isActive
                      ? 'border-brand-500 bg-brand-500 text-ink-950'
                      : 'border-ink-700 bg-ink-850 text-zinc-300 hover:border-ink-600 hover:text-zinc-50'
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0">
        <Outlet />
      </div>
    </section>
  )
}
