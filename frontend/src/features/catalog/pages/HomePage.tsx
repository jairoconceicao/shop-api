export function HomePage() {
  return (
    <>
      <section className="border-b border-ink-700/70 bg-ink-900">
        <div className="container-page py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-brand-400">Shop Api</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
              Encontre produtos para o seu dia a dia
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Navegue pelo catálogo e encontre o que você procura.
            </p>
            <a
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-500 px-5 py-2.5 font-semibold text-ink-950 transition-colors hover:bg-brand-400"
              href="#catalogo"
            >
              Explorar catálogo
            </a>
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14" id="catalogo">
        <header>
          <h2 className="text-2xl font-bold text-zinc-50 sm:text-3xl">Catálogo</h2>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Explore os produtos disponíveis por categoria.
          </p>
        </header>
      </section>
    </>
  )
}
