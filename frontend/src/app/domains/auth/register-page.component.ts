import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container>
      <section class="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-stretch">
        <article class="overflow-hidden rounded-[2rem] border border-shop-border bg-[linear-gradient(160deg,#0f172a_0%,#1d4ed8_55%,#f97316_180%)] p-6 text-shop-text-inverted shadow-soft lg:p-10">
          <span class="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Cadastro publico</span>
          <h1 class="mt-5 text-3xl font-black tracking-tight lg:text-5xl">Crie sua conta e comece a comprar.</h1>
          <p class="mt-4 max-w-xl text-sm leading-7 text-white/78 lg:text-base">
            Em poucos passos, voce prepara seu acesso para acompanhar pedidos, salvar dados do cliente e concluir compras com mais rapidez.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <a
              routerLink="/login"
              class="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-shop-primary transition hover:bg-white/90"
            >
              Ja tenho conta
            </a>
            <a
              routerLink="/products"
              class="rounded-2xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              Explorar catalogo
            </a>
          </div>
        </article>

        <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
          <span class="inline-flex rounded-full bg-shop-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-shop-primary">
            O que vem a seguir
          </span>
          <h2 class="mt-4 text-2xl font-black tracking-tight text-shop-text">Cadastro pensado para a jornada de compra.</h2>
          <p class="mt-3 text-sm leading-7 text-shop-text-muted lg:text-base">
            Esta base publica foi criada para receber o formulario completo do cliente sem misturar autenticacao com o fluxo de primeira compra.
          </p>

          <div class="mt-8 grid gap-4">
            <div class="rounded-2xl border border-shop-border bg-shop-background p-4">
              <p class="text-sm font-bold text-shop-text">Acesso rapido</p>
              <p class="mt-2 text-sm leading-6 text-shop-text-muted">
                O cadastro fica visivel na area publica e pode ser acessado sem login previo.
              </p>
            </div>

            <div class="rounded-2xl border border-shop-border bg-shop-background p-4">
              <p class="text-sm font-bold text-shop-text">Jornada clara</p>
              <p class="mt-2 text-sm leading-6 text-shop-text-muted">
                O fluxo foi separado do login para manter a experiencia de entrada simples e previsivel.
              </p>
            </div>

            <div class="rounded-2xl border border-shop-border bg-shop-background p-4">
              <p class="text-sm font-bold text-shop-text">Base pronta</p>
              <p class="mt-2 text-sm leading-6 text-shop-text-muted">
                A pagina ja abre com o layout e a navegacao necessarias para receber os proximos passos do cadastro.
              </p>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <a
              routerLink="/login"
              class="rounded-2xl border border-shop-border px-5 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
            >
              Voltar para login
            </a>
          </div>
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {}
