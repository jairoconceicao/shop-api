import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ButtonComponent } from '@shared/ui/base/button.component';

@Component({
  selector: 'app-cart-summary',
  imports: [ButtonComponent],
  template: `
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
          {{ ctaLabel() }}
        </app-button>
      </div>

      <ng-content />
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummaryComponent {
  readonly subtotal = input(0);
  readonly shipping = input(0);
  readonly ctaLabel = input('Finalizar compra');

  protected readonly total = computed(() => this.subtotal() + this.shipping());

  protected formatCurrency(value: number | string): string {
    const numericValue = typeof value === 'number' ? value : Number(value);

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number.isFinite(numericValue) ? numericValue : 0);
  }
}
