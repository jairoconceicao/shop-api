import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { DropdownMenu } from '../../shared/ui/overlays/DropdownMenu'

export interface HeaderCustomer {
  name: string
  email: string
}

export interface HeaderProps {
  customer?: HeaderCustomer | null
  onSignOut?: () => void
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

const menuItemClasses =
  'flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-zinc-200 hover:bg-ink-700 hover:text-zinc-50'

function SearchForm() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('busca')?.toString().trim()
    navigate(query ? `/?busca=${encodeURIComponent(query)}` : '/')
  }

  return (
    <form className="w-full md:max-w-2xl md:flex-1" role="search" onSubmit={handleSubmit}>
      <label className="relative block">
        <span className="sr-only">Buscar produtos</span>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <Icon>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </Icon>
        </span>
        <input
          name="busca"
          type="search"
          placeholder="Buscar produtos, marcas e mais..."
          className="min-h-11 w-full rounded-xl border border-ink-700 bg-ink-800 py-2.5 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 hover:border-ink-600 focus:border-brand-500 focus:outline-none"
        />
      </label>
    </form>
  )
}

function CustomerMenu({ customer, onSignOut }: HeaderProps) {
  return (
    <DropdownMenu
      label="Área do cliente"
      trigger={
        <>
          <Icon>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </Icon>
          <span className="hidden text-sm sm:inline">{customer ? 'Minha conta' : 'Entrar'}</span>
        </>
      }
    >
      {customer ? (
        <>
          <div className="border-b border-ink-700 px-3 pb-3 pt-1">
            <p className="truncate text-sm font-semibold text-zinc-100">{customer.name}</p>
            <p className="truncate text-xs text-zinc-500">{customer.email}</p>
          </div>
          <Link className={`${menuItemClasses} mt-1`} to="/pedidos" role="menuitem">
            Meus pedidos
          </Link>
          <Link className={menuItemClasses} to="/minha-conta/dados" role="menuitem">
            Meus dados
          </Link>
          <Link className={menuItemClasses} to="/minha-conta/senha" role="menuitem">
            Trocar senha
          </Link>
          <button
            className={`${menuItemClasses} border-t border-ink-700 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200`}
            type="button"
            role="menuitem"
            onClick={onSignOut}
          >
            Sair
          </button>
        </>
      ) : (
        <Link className={menuItemClasses} to="/entrar" role="menuitem">
          Entrar
        </Link>
      )}
    </DropdownMenu>
  )
}

export function Header({ customer = null, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/90 backdrop-blur-xl">
      <div className="container-page py-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl" to="/" aria-label="Shop — ir ao catálogo">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-500 font-black text-ink-950">
              S
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-zinc-50 sm:inline">
              shop<span className="text-brand-400">.</span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 md:flex">
            <SearchForm />
          </div>

          <nav className="ml-auto flex items-center gap-1" aria-label="Ações da loja">
            <Link
              className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-zinc-200 hover:bg-ink-750"
              to="/carrinho"
              aria-label="Carrinho"
            >
              <Icon>
                <circle cx="9" cy="20" r="1" />
                <circle cx="19" cy="20" r="1" />
                <path d="M3 3h2l2.4 12.4A2 2 0 0 0 9.4 17h8.2a2 2 0 0 0 2-1.6L22 7H6" />
              </Icon>
              <span className="hidden text-sm lg:inline">Carrinho</span>
            </Link>
            <CustomerMenu customer={customer} onSignOut={onSignOut} />
          </nav>
        </div>

        <div className="pt-2 md:hidden">
          <SearchForm />
        </div>
      </div>
    </header>
  )
}
