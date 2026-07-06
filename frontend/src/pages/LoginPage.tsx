export function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-spanish-green-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight text-spanish-green-950">Login</h1>
      <p className="mt-2 text-sm leading-6 text-spanish-green-700">
        A autenticação será implementada na Fase 3. A rota já está pronta para receber o formulário
        e a integração com a API.
      </p>

      <form className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-spanish-green-800">E-mail</span>
          <input
            type="email"
            placeholder="voce@exemplo.com"
            className="w-full rounded-2xl border border-spanish-green-200 bg-spanish-green-50 px-4 py-3 outline-none transition focus:border-spanish-green-500 focus:ring-4 focus:ring-spanish-green-200"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-spanish-green-800">Senha</span>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-2xl border border-spanish-green-200 bg-spanish-green-50 px-4 py-3 outline-none transition focus:border-spanish-green-500 focus:ring-4 focus:ring-spanish-green-200"
          />
        </label>

        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-spanish-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-spanish-green-600 focus:outline-none focus:ring-4 focus:ring-spanish-green-200"
        >
          Entrar
        </button>
      </form>
    </section>
  );
}
