import { LinkButton } from '../../shared/ui/buttons/LinkButton'

export function NotFoundPage() {
  return (
    <section className="container-page flex min-h-dvh items-center justify-center py-12 text-center">
      <div className="flex max-w-xl flex-col items-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">
          Erro 404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          Página não encontrada
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-400">
          O endereço informado não existe ou não está mais disponível.
        </p>
        <LinkButton to="/" size="lg" className="mt-8">
          Voltar ao catálogo
        </LinkButton>
      </div>
    </section>
  )
}
