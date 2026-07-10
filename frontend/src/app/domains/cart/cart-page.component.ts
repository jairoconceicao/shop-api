import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartStore } from './cart.store';
import { PageContainerComponent } from '@shared/ui/page-container.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';
import { CartItemComponent } from '@shared/ui/cart/cart-item.component';
import { CartSummaryComponent } from '@shared/ui/cart/cart-summary.component';

@Component({
  selector: 'app-cart-page',
  imports: [
    RouterLink,
    PageContainerComponent,
    EmptyStateComponent,
    CartItemComponent,
    CartSummaryComponent,
  ],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-8">
        <article class="border-shop-border shadow-soft overflow-hidden rounded-[2rem] border bg-white">
          <div class="border-shop-border bg-[linear-gradient(135deg,#08121f_0%,#10243d_55%,#dbeafe_100%)] px-5 py-6 text-white lg:px-10 lg:py-10">
            <span class="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.24em] text-white/80 uppercase">
              Carrinho
            </span>
            <h1 class="mt-4 text-4xl font-black tracking-tight text-balance sm:text-5xl">
              Revise seus itens antes de finalizar a compra.
            </h1>
            <p class="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
              A rota protege o fluxo de compra e mantém o resumo do pedido sempre visível no mobile e no desktop.
            </p>
          </div>

          @if (isEmpty()) {
            <div class="px-5 py-6 lg:px-10 lg:py-10">
              <app-empty-state
                eyebrow="Carrinho vazio"
                title="Seu carrinho está vazio"
                description="Explore o catálogo e adicione produtos para começar a comprar."
              >
                <a
                  routerLink="/products"
                  class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
                >
                  Ver produtos
                </a>
              </app-empty-state>
            </div>
          } @else {
            <div class="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-10 lg:py-10">
              <section class="space-y-4" aria-labelledby="cart-items-title">
                <div class="flex items-end justify-between gap-4">
                  <div>
                    <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                      Itens
                    </p>
                    <h2 id="cart-items-title" class="text-shop-text mt-2 text-2xl font-black tracking-tight">
                      Produtos no carrinho
                    </h2>
                  </div>
                  <span class="text-shop-text-muted text-sm font-medium">
                    {{ itemCount() }} item(ns)
                  </span>
                </div>

                <div class="space-y-3">
                  @for (item of items(); track item.itemId) {
                    <app-cart-item [item]="item" />
                  }
                </div>
              </section>

              <app-cart-summary [subtotal]="subtotal()" [shipping]="shipping()">
                <a
                  routerLink="/products"
                  class="border-shop-border text-shop-text hover:border-shop-primary/30 hover:text-shop-primary mt-3 inline-flex w-full items-center justify-center rounded-2xl border px-5 py-3 text-sm font-bold transition"
                >
                  Continuar comprando
                </a>
              </app-cart-summary>
            </div>
          }
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPageComponent {
  private readonly cartStore = inject(CartStore);

  protected readonly items = this.cartStore.items;
  protected readonly itemCount = this.cartStore.itemCount;
  protected readonly subtotal = this.cartStore.subtotal;
  protected readonly isEmpty = this.cartStore.isEmpty;
  protected readonly shipping = computed(() => 0);
}
