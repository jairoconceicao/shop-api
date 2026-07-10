import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RegisterFormComponent } from './register-form.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, PageContainerComponent, RegisterFormComponent],
  template: `
    <app-page-container>
      <section class="grid gap-6 lg:grid-cols-[1fr_0.98fr] lg:items-stretch">
        <article class="overflow-hidden rounded-[2rem] border border-shop-border bg-[linear-gradient(160deg,#0f172a_0%,#1d4ed8_55%,#f97316_180%)] p-6 text-shop-text-inverted shadow-soft lg:p-10">
          <span class="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Cadastro publico</span>
          <h1 class="mt-5 text-3xl font-black tracking-tight lg:text-5xl">Crie sua conta e comece a comprar.</h1>
          <p class="mt-4 max-w-xl text-sm leading-7 text-white/78 lg:text-base">
            Em poucos passos, voce prepara seu acesso com dados pessoais, endereco e celular para acompanhar pedidos e concluir compras com mais rapidez.
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
        <app-register-form />
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {}
