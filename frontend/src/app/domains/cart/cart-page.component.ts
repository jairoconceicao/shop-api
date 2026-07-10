import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartStore } from './cart.store';
import { ButtonComponent } from '@shared/ui/base/button.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, ButtonComponent, PageContainerComponent, EmptyStateComponent],
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
                    <article class="border-shop-border rounded-[1.5rem] border bg-white p-4 shadow-soft">
                      <div class="flex items-start justify-between gap-4">
                        <div class="min-w-0">
                          <p class="text-shop-text text-lg font-bold">
                            Produto #{{ item.produtoId }}
                          </p>
                          <p class="text-shop-text-muted mt-1 text-sm">
                            Item #{{ item.itemId }} • Quantidade {{ item.quantidade }}
                          </p>
                        </div>

                        <p class="text-shop-price text-right text-lg font-black">
                          {{ formatCurrency(itemTotal(item)) }}
                        </p>
                      </div>

                      <dl class="mt-4 grid gap-3 sm:grid-cols-3">
                        <div class="rounded-2xl bg-shop-surface-muted p-3">
                          <dt class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
                            Unitário
                          </dt>
                          <dd class="text-shop-text mt-2 text-sm font-semibold">
                            {{ formatCurrency(item.valorUnitario) }}
                          </dd>
                        </div>

                        <div class="rounded-2xl bg-shop-surface-muted p-3">
                          <dt class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
                            Quantidade
                          </dt>
                          <dd class="text-shop-text mt-2 text-sm font-semibold">
                            {{ item.quantidade }}
                          </dd>
                        </div>

                        <div class="rounded-2xl bg-shop-surface-muted p-3">
                          <dt class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
                            Subtotal
                          </dt>
                          <dd class="text-shop-text mt-2 text-sm font-semibold">
                            {{ formatCurrency(itemTotal(item)) }}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  }
                </div>
              </section>

              <aside class="rounded-[1.75rem] border border-shop-border bg-shop-background p-5 shadow-soft lg:sticky lg:top-6">
                <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                  Resumo
                </p>
                <h2 class="text-shop-text mt-2 text-2xl font-black tracking-tight">
                  Total do pedido
                </h2>

                <div class="mt-5 space-y-3 text-sm text-shop-text-muted">
                  <div class="flex items-center justify-between gap-4">
                    <span>Produtos</span>
                    <span>{{ formatCurrency(subtotal()) }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span>Frete</span>
                    <span class="text-shop-free-shipping">{{ formatCurrency(shipping()) }}</span>
                  </div>
                  <div class="border-shop-border flex items-center justify-between gap-4 border-t pt-4 text-lg font-black text-shop-text">
                    <span>Total</span>
                    <span>{{ formatCurrency(total()) }}</span>
                  </div>
                </div>

                <div class="mt-6">
                  <app-button type="button" size="lg" [block]="true">
                    Finalizar compra
                  </app-button>
                </div>

                <a
                  routerLink="/products"
                  class="border-shop-border text-shop-text hover:border-shop-primary/30 hover:text-shop-primary mt-3 inline-flex w-full items-center justify-center rounded-2xl border px-5 py-3 text-sm font-bold transition"
                >
                  Continuar comprando
                </a>
              </aside>
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
  protected readonly total = computed(() => this.subtotal() + this.shipping());

  protected itemTotal(item: { quantidade: number | string; valorUnitario: number | string }): number {
    return toNumber(item.quantidade) * toNumber(item.valorUnitario);
  }

  protected formatCurrency(value: number | string): string {
    const numericValue = toNumber(value);

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  }
}

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}
