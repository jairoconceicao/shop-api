import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-checkout-page',
  imports: [RouterLink, PageContainerComponent],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-6">
        <article class="overflow-hidden rounded-[2rem] border border-shop-border bg-white shadow-soft">
          <div class="bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#dbeafe_100%)] px-5 py-6 text-white lg:px-10 lg:py-10">
            <span class="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white/80">
              Checkout protegido
            </span>
            <h1 class="mt-4 text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Finalize sua compra com segurança.
            </h1>
            <p class="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
              Esta rota já está protegida por autenticação e recebe a base do fluxo de compra, sem antecipar os
              campos do pedido.
            </p>
          </div>

          <div class="grid gap-4 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-10 lg:py-10">
            <div class="rounded-[1.5rem] bg-shop-background p-5">
              <p class="text-shop-text-light text-xs font-bold uppercase tracking-[0.24em]">Estado atual</p>
              <h2 class="mt-3 text-2xl font-black tracking-tight text-shop-text">Checkout pronto para evolucao.</h2>
              <p class="mt-3 max-w-2xl text-sm leading-7 text-shop-text-muted">
                A rota existe para receber carrinho, endereco e pagamento nas proximas tarefas, mantendo o acesso
                restrito a usuarios autenticados.
              </p>
            </div>

            <aside class="rounded-[1.5rem] border border-shop-border bg-shop-surface-muted p-5">
              <h2 class="text-lg font-bold text-shop-text">Navegacao</h2>
              <div class="mt-4 space-y-3">
                <a
                  routerLink="/cart"
                  class="block rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-shop-text transition hover:text-shop-primary"
                >
                  Voltar ao carrinho
                </a>
                <a
                  routerLink="/products"
                  class="block rounded-2xl border border-shop-border px-4 py-3 text-center text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
                >
                  Continuar comprando
                </a>
              </div>
            </aside>
          </div>
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent {}
