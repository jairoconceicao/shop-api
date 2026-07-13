/*
  Shop-Api — Layout compartilhado (header + footer)
  -------------------------------------------------
  Injetado via JS para manter consistência entre as páginas e funcionar
  sob file://. O atributo data-auth="in|out" no placeholder define o
  estado do menu da Área do Cliente.
    - "out": mostra apenas "Entrar" (redireciona para login.html)
    - "in" : mostra identidade + Meus Pedidos / Meus Dados / Trocar
             Senha / Sair
*/
(() => {
  const icon = (d) =>
    `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

  const ICONS = {
    search: `<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>`,
    cart: `<circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 3h2l2.6 13.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L23 7H6"/>`,
    user: `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
    orders: `<path d="M6 2 4 6v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4Z"/><path d="M4 6h16"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
    data: `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
    lock: `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
    logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>`,
    login: `<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>`,
  };

  function menuItems(auth) {
    if (auth === "out") {
      return `
        <div class="p-2">
          <a href="login.html" class="btn-primary w-full" role="menuitem">
            ${icon(ICONS.login)} Entrar
          </a>
        </div>
        <div class="hairline my-1"></div>
        <a href="pedidos.html" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-ink-800 hover:text-zinc-50 transition-colors" role="menuitem">
          ${icon(ICONS.orders)} Meus Pedidos
        </a>`;
    }
    return `
      <div class="flex items-center gap-3 px-3 py-3">
        <span class="grid place-items-center h-10 w-10 rounded-full bg-ink-800 text-brand-400 font-bold">JC</span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-zinc-100 truncate">João Cliente</p>
          <p class="text-xs text-zinc-500 truncate">joao@email.com</p>
        </div>
      </div>
      <div class="hairline my-1"></div>
      <a href="pedidos.html" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-ink-800 hover:text-zinc-50 transition-colors" role="menuitem">
        ${icon(ICONS.orders)} Meus Pedidos
      </a>
      <a href="dados.html" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-ink-800 hover:text-zinc-50 transition-colors" role="menuitem">
        ${icon(ICONS.data)} Meus Dados
      </a>
      <a href="senha.html" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-ink-800 hover:text-zinc-50 transition-colors" role="menuitem">
        ${icon(ICONS.lock)} Trocar Senha
      </a>
      <div class="hairline my-1"></div>
      <a href="index.html" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors" role="menuitem">
        ${icon(ICONS.logout)} Sair
      </a>`;
  }

  function header(auth) {
    return `
    <header class="glass sticky top-0 z-50">
      <div class="container-page">
        <div class="flex h-16 items-center gap-3">
          <a href="index.html" class="flex items-center gap-2 shrink-0">
            <span class="grid place-items-center h-9 w-9 rounded-xl bg-brand-500 text-ink-950 font-black">S</span>
            <span class="text-lg font-bold tracking-tight text-zinc-50">shop<span class="text-brand-400">.</span></span>
          </a>

          <form class="hidden md:flex flex-1 max-w-2xl" role="search">
            <div class="relative w-full">
              <input class="input pl-11" placeholder="Buscar produtos, marcas e mais..." aria-label="Buscar" />
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">${icon(ICONS.search)}</span>
            </div>
          </form>

          <div class="ml-auto flex items-center gap-1">
            <a href="carrinho.html" class="btn-ghost !px-3 relative" aria-label="Carrinho">
              ${icon(ICONS.cart)}
              <span data-cart-count class="hidden absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-brand-500 text-ink-950 text-[11px] font-bold grid place-items-center">0</span>
            </a>

            <div data-customer-menu class="relative">
              <button data-customer-toggle class="btn-ghost !px-3" aria-haspopup="menu" aria-expanded="false" aria-label="Área do cliente">
                ${icon(ICONS.user)}
              </button>
              <div data-customer-panel class="absolute right-0 top-full mt-2 w-64 surface-raised p-2 opacity-0 invisible translate-y-2 transition-all duration-200 z-50" role="menu">
                ${menuItems(auth)}
              </div>
            </div>
          </div>
        </div>

        <nav class="hidden sm:flex items-center gap-1 h-12 -mt-1 overflow-x-auto">
          <a href="#" class="nav-link">Ofertas</a>
          <a href="#" class="nav-link">Hardware</a>
          <a href="#" class="nav-link">Notebooks</a>
          <a href="#" class="nav-link">Periféricos</a>
          <a href="#" class="nav-link">Monitores</a>
          <a href="#" class="nav-link">Celulares</a>
          <a href="#" class="nav-link">Games</a>
        </nav>
      </div>
    </header>`;
  }

  function footer() {
    return `
    <footer class="border-t border-ink-800 bg-ink-900">
      <div class="container-page py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="grid place-items-center h-8 w-8 rounded-lg bg-brand-500 text-ink-950 font-black">S</span>
            <span class="font-bold text-zinc-50">shop<span class="text-brand-400">.</span></span>
          </div>
          <p class="mt-3 text-sm text-zinc-500 max-w-xs">Loja de tecnologia com os melhores preços e entrega rápida para todo o Brasil.</p>
        </div>
        <div>
          <p class="label">Institucional</p>
          <ul class="space-y-2 text-sm text-zinc-400">
            <li><a href="#" class="hover:text-zinc-100">Sobre nós</a></li>
            <li><a href="#" class="hover:text-zinc-100">Política de privacidade</a></li>
            <li><a href="#" class="hover:text-zinc-100">Termos de uso</a></li>
          </ul>
        </div>
        <div>
          <p class="label">Atendimento</p>
          <ul class="space-y-2 text-sm text-zinc-400">
            <li><a href="#" class="hover:text-zinc-100">Central de ajuda</a></li>
            <li><a href="#" class="hover:text-zinc-100">Trocas e devoluções</a></li>
            <li><a href="#" class="hover:text-zinc-100">Rastrear pedido</a></li>
          </ul>
        </div>
        <div>
          <p class="label">Pagamento</p>
          <div class="flex flex-wrap gap-2">
            <span class="badge-neutral">Pix</span>
            <span class="badge-neutral">Visa</span>
            <span class="badge-neutral">Master</span>
            <span class="badge-neutral">Boleto</span>
          </div>
        </div>
      </div>
      <div class="border-t border-ink-800">
        <div class="container-page py-5 text-xs text-zinc-600 flex flex-wrap items-center justify-between gap-2">
          <p>© 2026 shop. — Mockup de ideação front-end.</p>
          <p>HTML5 · VanillaJS · TailwindCSS 4</p>
        </div>
      </div>
    </footer>`;
  }

  function inject() {
    document.querySelectorAll("[data-header]").forEach((el) => {
      el.outerHTML = header(el.dataset.auth || "in");
    });
    document.querySelectorAll("[data-footer]").forEach((el) => {
      el.outerHTML = footer();
    });
  }

  // Injeta antes do DOMContentLoaded para evitar flash, e re-inicializa
  // os behaviours do app.js que dependem do header já no DOM.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      inject();
      window.__layoutReady?.();
    });
  } else {
    inject();
    window.__layoutReady?.();
  }
})();
