const catalogHighlights = [
  "Base do app em React + Vite",
  "Tailwind CSS v4 com paleta spanish-green",
  "Cliente HTTP centralizado para a API v1",
  "Rotas globais para os fluxos do e-commerce",
];

export function HomePage() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="rounded-3xl border border-spanish-green-200 bg-white p-8 shadow-sm">
        <span className="inline-flex rounded-full bg-spanish-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-spanish-green-700">
          Fase 1 concluída
        </span>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-spanish-green-950 sm:text-5xl">
          Estrutura base pronta para catálogo, carrinho, checkout e pedidos.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-spanish-green-700">
          Esta é a SPA inicial do Shop API. O layout global, o roteamento e a camada de integração
          com o backend local já estão preparados para receber os fluxos de negócio da próxima fase.
        </p>
      </div>

      <aside className="rounded-3xl border border-spanish-green-200 bg-spanish-green-900 p-8 text-spanish-green-50 shadow-lg shadow-spanish-green-950/10">
        <h2 className="text-lg font-semibold">Base técnica</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-spanish-green-100">
          {catalogHighlights.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 size-2 rounded-full bg-spanish-green-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
