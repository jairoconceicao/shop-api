import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-start rounded-3xl border border-spanish-green-200 bg-white p-8 shadow-sm">
      <span className="rounded-full bg-spanish-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-spanish-green-700">
        404
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-spanish-green-950">
        Página não encontrada
      </h1>
      <p className="mt-2 text-sm leading-6 text-spanish-green-700">
        O endereço solicitado não existe nesta etapa da SPA.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-spanish-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-spanish-green-600"
      >
        Voltar aos produtos
      </Link>
    </section>
  );
}

