type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="rounded-3xl border border-dashed border-spanish-green-300 bg-white/70 p-8">
      <h1 className="text-2xl font-semibold text-spanish-green-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-spanish-green-700">
        Rota reservada na estrutura base. O fluxo correspondente será implementado nas próximas fases
        sem alterar a navegação central.
      </p>
    </section>
  );
}
