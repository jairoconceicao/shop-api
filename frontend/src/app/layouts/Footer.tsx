import { Link } from 'react-router-dom'

const navigation = [
  { label: 'Catálogo', to: '/' },
  { label: 'Carrinho', to: '/carrinho' },
  { label: 'Meus pedidos', to: '/pedidos' },
  { label: 'Minha conta', to: '/minha-conta/dados' },
] as const

const paymentMethods = ['Pix', 'Cartão', 'Boleto'] as const

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-900">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl"
            to="/"
            aria-label="Shop — ir ao catálogo"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-brand-500 font-black text-ink-950">
              S
            </span>
            <span className="font-bold text-zinc-50">
              shop<span className="text-brand-400">.</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-zinc-500">
            Consulte os produtos disponíveis em nosso catálogo.
          </p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="text-sm font-semibold text-zinc-200">Navegação</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            {navigation.map((item) => (
              <li key={item.to}>
                <Link className="rounded hover:text-zinc-100" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="footer-payment-methods">
          <h2 id="footer-payment-methods" className="text-sm font-semibold text-zinc-200">
            Formas de pagamento
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <li
                className="rounded-full border border-ink-700 bg-ink-800 px-3 py-1 text-xs text-zinc-300"
                key={method}
              >
                {method}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="border-t border-ink-800">
        <div className="container-page py-5 text-xs text-zinc-600">© 2026 shop.</div>
      </div>
    </footer>
  )
}
