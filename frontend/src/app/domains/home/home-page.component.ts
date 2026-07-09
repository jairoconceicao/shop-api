import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container [wide]="true">
      <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article class="overflow-hidden rounded-[2rem] border border-shop-border bg-[radial-gradient(circle_at_top_left,#ffffff_0%,#dbeafe_32%,#f8fafc_72%)] p-6 shadow-soft lg:p-10">
          <span class="inline-flex rounded-full bg-shop-secondary-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-shop-secondary">Fundacao pronta</span>
          <h1 class="mt-5 max-w-xl text-4xl font-black tracking-tight text-shop-text lg:text-6xl">Sua nova vitrine Angular com cara de e-commerce real.</h1>
          <p class="mt-5 max-w-2xl text-base leading-7 text-shop-text-muted lg:text-lg">
            Layout mobile first, tokens globais, rotas publicas e privadas iniciais e cadeia de qualidade preparada
            para o backlog do storefront.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/products" class="rounded-full bg-shop-primary px-6 py-3 text-sm font-bold text-shop-text-inverted shadow-[0_18px_38px_rgba(37,99,235,0.22)] transition hover:bg-shop-primary-hover">Ver catalogo</a>
            <a routerLink="/login" class="rounded-full border border-shop-border bg-white px-6 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary">Entrar</a>
          </div>
          <dl class="mt-10 grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl bg-white/80 p-4">
              <dt class="text-xs font-bold uppercase tracking-[0.24em] text-shop-text-light">Stack</dt>
              <dd class="mt-2 text-lg font-bold text-shop-text">Angular 22 + Tailwind 4</dd>
            </div>
            <div class="rounded-2xl bg-white/80 p-4">
              <dt class="text-xs font-bold uppercase tracking-[0.24em] text-shop-text-light">Qualidade</dt>
              <dd class="mt-2 text-lg font-bold text-shop-text">ESLint, Vitest e Playwright</dd>
            </div>
            <div class="rounded-2xl bg-white/80 p-4">
              <dt class="text-xs font-bold uppercase tracking-[0.24em] text-shop-text-light">Arquitetura</dt>
              <dd class="mt-2 text-lg font-bold text-shop-text">Core, Shared e Domains</dd>
            </div>
          </dl>
        </article>

        <aside class="grid gap-4">
          <section class="rounded-[2rem] bg-shop-text p-6 text-shop-text-inverted shadow-soft">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-white/60">Pronto para evoluir</p>
            <ul class="mt-5 space-y-4 text-sm leading-6 text-white/78">
              <li>Camada HTTP e auth podem entrar sem refatorar o shell.</li>
              <li>Catalogo, carrinho e conta ja estao separados por dominio.</li>
              <li>O tema global ja entrega cores, superficies e ritmo visual.</li>
            </ul>
          </section>

          <section class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-shop-text-light">Rotas base</p>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <a routerLink="/" class="rounded-2xl bg-shop-surface-muted px-4 py-3 font-semibold text-shop-text">Home</a>
              <a routerLink="/login" class="rounded-2xl bg-shop-surface-muted px-4 py-3 font-semibold text-shop-text">Login</a>
              <a routerLink="/products" class="rounded-2xl bg-shop-surface-muted px-4 py-3 font-semibold text-shop-text">Catalogo</a>
              <a routerLink="/cart" class="rounded-2xl bg-shop-surface-muted px-4 py-3 font-semibold text-shop-text">Carrinho</a>
            </div>
          </section>
        </aside>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
