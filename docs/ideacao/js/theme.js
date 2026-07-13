/*
  Shop-Api — Tema/Design System injetado para o @tailwindcss/browser@4
  -------------------------------------------------------------------
  O build de browser do Tailwind 4 processa APENAS tags
  <style type="text/tailwindcss"> inline no documento — ele NÃO lê
  <link rel="stylesheet"> nem resolve @import url() de arquivos locais
  (lança "does not support @import"). Em file:// um fetch também seria
  bloqueado por CORS.

  Por isso o CSS é embarcado aqui como string e injetado como uma tag
  <style type="text/tailwindcss"> em <head>. O MutationObserver do build
  detecta a tag e compila @theme / @utility / @layer / @apply normalmente.

  Observação sobre Tailwind v4: classes definidas em @layer components
  NÃO podem ser alvo de @apply ("Cannot apply unknown utility class").
  Por isso as bases reutilizáveis (surface-raised, btn, chip, badge) são
  declaradas com @utility (que registra utilitários válidos para @apply).
  Este arquivo é a fonte única da verdade do design system.
*/
(() => {
  const css = `@import "tailwindcss";

/*
  Shop-Api — Design System (Dark Mode Minimalista)
  --------------------------------------------------
  Paleta sober-dark: base zinc + acento amber.
  Hierarquia visual via contraste de superfícies (ink-950 -> ink-900 ->
  ink-850) e tipografia escalonada. Espaçamento generoso (8/12/16/24px)
  para respiro visual. Acessibilidade: foco visível, alvos de toque >=40px.
*/

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, sans-serif;

  /* Brand — acento sóbrio sobre fundo escuro */
  --color-brand-50: #fffbeb;
  --color-brand-100: #fef3c7;
  --color-brand-200: #fde68a;
  --color-brand-300: #fcd34d;
  --color-brand-400: #fbbf24;
  --color-brand-500: #f59e0b;
  --color-brand-600: #d97706;
  --color-brand-700: #b45309;

  /* Surfaces — escala "ink" para escurecimento controlado */
  --color-ink-950: #08080b;
  --color-ink-900: #0d0d12;
  --color-ink-850: #121219;
  --color-ink-800: #18181f;
  --color-ink-750: #1e1e27;
  --color-ink-700: #262631;
  --color-ink-600: #34343f;

  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
}

/* ---- Bases reutilizáveis (@utility) ----
   Em Tailwind v4, @utility registra a classe como utilitário real,
   permitindo composição via @apply e uso direto no HTML. As variantes
   em @layer components abaixo reaproveitam estas bases. */
@utility surface-raised {
  @apply bg-ink-850 border border-ink-700/80 rounded-2xl shadow-xl shadow-black/40;
}

@utility btn {
  @apply inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5
    text-sm font-semibold tracking-tight transition-all duration-200
    disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap;
}

@utility chip {
  @apply inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5
    text-xs font-medium text-zinc-400 border border-ink-700
    hover:border-brand-500/50 hover:text-zinc-100 transition-colors cursor-pointer;
}

@utility badge {
  @apply inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
    text-xs font-medium;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-ink-950 text-zinc-200 font-sans antialiased;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  /* Foco visível padronizado para acessibilidade */
  :where(a, button, input, select, textarea, [tabindex]):focus-visible {
    @apply outline-none ring-2 ring-brand-400/70 ring-offset-2 ring-offset-ink-950 rounded-md;
  }

  ::selection {
    @apply bg-brand-400/30 text-zinc-50;
  }

  /* Scrollbar discreta */
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--color-ink-700) transparent;
  }
}

@layer components {
  /* ---- Superfícies ---- */
  .surface {
    @apply bg-ink-900 border border-ink-700/70 rounded-2xl;
  }

  .card {
    @apply surface-raised overflow-hidden transition-all duration-300;
  }

  .card-hover {
    @apply hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-brand-500/5;
  }

  /* ---- Botões ---- */
  .btn-primary {
    @apply btn bg-brand-500 text-ink-950 hover:bg-brand-400
      active:scale-[.98] shadow-lg shadow-brand-500/20;
  }

  .btn-secondary {
    @apply btn bg-ink-800 text-zinc-100 border border-ink-700
      hover:bg-ink-750 hover:border-ink-600;
  }

  .btn-ghost {
    @apply btn bg-transparent text-zinc-300 hover:bg-ink-800 hover:text-zinc-50;
  }

  .btn-danger {
    @apply btn bg-transparent text-rose-300 border border-rose-500/30
      hover:bg-rose-500/10 hover:border-rose-500/50;
  }

  /* ---- Inputs ---- */
  .input {
    @apply w-full rounded-xl bg-ink-850 border border-ink-700 px-4 py-3
      text-sm text-zinc-100 placeholder:text-zinc-500
      transition-colors focus:border-brand-500/60;
  }

  .label {
    @apply block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2;
  }

  /* ---- Badges ---- */
  .badge-success {
    @apply badge bg-emerald-500/10 text-emerald-300 border border-emerald-500/20;
  }

  .badge-warn {
    @apply badge bg-amber-500/10 text-amber-300 border border-amber-500/20;
  }

  .badge-danger {
    @apply badge bg-rose-500/10 text-rose-300 border border-rose-500/20;
  }

  .badge-neutral {
    @apply badge bg-ink-800 text-zinc-400 border border-ink-700;
  }

  .badge-brand {
    @apply badge bg-brand-500/10 text-brand-300 border border-brand-500/20;
  }

  /* ---- Navegação ---- */
  .nav-link {
    @apply text-sm text-zinc-400 hover:text-zinc-50 transition-colors
      px-3 py-2 rounded-lg hover:bg-ink-800;
  }

  .chip-active {
    @apply chip bg-brand-500/10 text-brand-300 border-brand-500/40;
  }

  /* ---- Tipografia ---- */
  .eyebrow {
    @apply text-xs font-semibold uppercase tracking-[0.2em] text-brand-400;
  }

  .section-title {
    @apply text-xl sm:text-2xl font-bold tracking-tight text-zinc-50;
  }

  .price {
    @apply font-bold tracking-tight text-zinc-50;
  }

  .price-strike {
    @apply text-sm text-zinc-500 line-through font-normal;
  }

  /* ---- Produto ---- */
  .product-media {
    @apply relative aspect-square bg-gradient-to-br from-ink-800 to-ink-900
      flex items-center justify-center overflow-hidden;
  }

  .qty {
    @apply inline-flex items-center rounded-xl border border-ink-700 bg-ink-850
      overflow-hidden;
  }

  .qty button {
    @apply w-10 h-10 grid place-items-center text-zinc-300
      hover:bg-ink-800 hover:text-zinc-50 transition-colors;
  }

  .qty input {
    @apply w-12 h-10 bg-transparent text-center text-sm text-zinc-100
      border-x border-ink-700 outline-none;
  }

  /* ---- Divisor sutil ---- */
  .hairline {
    @apply h-px w-full bg-gradient-to-r from-transparent via-ink-700 to-transparent;
  }
}

@layer utilities {
  .container-page {
    @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
  }

  .text-balance {
    text-wrap: balance;
  }

  .glass {
    @apply bg-ink-900/80 backdrop-blur-xl border-b border-ink-700/60;
  }

  /* Textura de grid sutil para hero */
  .bg-grid {
    background-image: radial-gradient(
      circle at 1px 1px,
      var(--color-ink-700) 1px,
      transparent 0
    );
    background-size: 24px 24px;
  }
}
`;

  const style = document.createElement("style");
  style.type = "text/tailwindcss";
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();
