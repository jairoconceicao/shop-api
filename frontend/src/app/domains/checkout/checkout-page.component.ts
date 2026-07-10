import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { createCheckoutState } from './checkout.context';
import { CartItemComponent } from '@shared/ui/cart/cart-item.component';
import { CartSummaryComponent } from '@shared/ui/cart/cart-summary.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-checkout-page',
  imports: [
    RouterLink,
    PageContainerComponent,
    EmptyStateComponent,
    CartItemComponent,
    CartSummaryComponent,
  ],
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
            @if (isEmpty()) {
              <div class="rounded-[1.5rem] bg-shop-background p-5">
                <app-empty-state
                  eyebrow="Carrinho ativo"
                  title="Adicione produtos ao carrinho antes de continuar"
                  description="O checkout reutiliza os dados do carrinho ativo para manter o fluxo de compra consistente."
                >
                  <a
                    routerLink="/cart"
                    class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
                  >
                    Ir para o carrinho
                  </a>
                </app-empty-state>
              </div>
            } @else {
              <section class="space-y-4" aria-labelledby="checkout-items-title">
                <div>
                  <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                    Carrinho ativo
                  </p>
                  <h2 id="checkout-items-title" class="text-shop-text mt-2 text-2xl font-black tracking-tight">
                    Itens prontos para o pedido
                  </h2>
                  <p class="text-shop-text-muted mt-3 text-sm leading-7">
                    O checkout reaproveita os itens, quantidades e valores atuais do carrinho ativo.
                  </p>
                </div>

                <div class="space-y-3">
                  @for (item of items(); track item.itemId) {
                    <app-cart-item [item]="item" />
                  }
                </div>
              </section>

              <app-cart-summary [subtotal]="subtotal()" [shipping]="shipping()" ctaLabel="Continuar checkout">
                <div class="mt-3 space-y-3">
                  <a
                    routerLink="/cart"
                    class="border-shop-border text-shop-text hover:border-shop-primary/30 hover:text-shop-primary inline-flex w-full items-center justify-center rounded-2xl border px-5 py-3 text-sm font-bold transition"
                  >
                    Revisar carrinho
                  </a>
                  <a
                    routerLink="/products"
                    class="border-shop-border text-shop-text hover:border-shop-primary/30 hover:text-shop-primary inline-flex w-full items-center justify-center rounded-2xl border px-5 py-3 text-sm font-bold transition"
                  >
                    Continuar comprando
                  </a>
                </div>
              </app-cart-summary>
            }
          </div>
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent {
  private readonly checkoutState = createCheckoutState();

  protected readonly items = this.checkoutState.items;
  protected readonly subtotal = this.checkoutState.subtotal;
  protected readonly shipping = this.checkoutState.shipping;
  protected readonly isEmpty = this.checkoutState.isEmpty;
}
