import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { QuantitySelectorComponent } from './quantity-selector.component';

type CartItemLike = {
  itemId: number | string;
  produtoId: number | string;
  quantidade: number | string;
  valorUnitario: number | string;
};

@Component({
  selector: 'app-cart-item',
  imports: [QuantitySelectorComponent],
  template: `
    <article class="rounded-[1.5rem] border border-shop-border bg-white p-4 shadow-soft">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <p class="text-shop-text text-lg font-bold">
            Produto #{{ item().produtoId }}
          </p>
          <p class="text-shop-text-muted mt-1 text-sm">
            Item #{{ item().itemId }}
          </p>
        </div>

        <p class="text-shop-price text-left text-lg font-black sm:text-right">
          {{ formatCurrency(total()) }}
        </p>
      </div>

      <dl class="mt-4 grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl bg-shop-surface-muted p-3">
          <dt class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
            Unitário
          </dt>
          <dd class="text-shop-text mt-2 text-sm font-semibold">
            {{ formatCurrency(item().valorUnitario) }}
          </dd>
        </div>

        <div class="rounded-2xl bg-shop-surface-muted p-3">
          <dt class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
            Quantidade
          </dt>
          <dd class="mt-2">
            <app-quantity-selector
              [quantity]="quantity()"
              [min]="1"
              (quantityChange)="quantityChange.emit($event)"
            />
          </dd>
        </div>

        <div class="rounded-2xl bg-shop-surface-muted p-3">
          <dt class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
            Subtotal
          </dt>
          <dd class="text-shop-text mt-2 text-sm font-semibold">
            {{ formatCurrency(total()) }}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        class="mt-4 text-sm font-bold text-shop-danger transition hover:text-shop-danger/80"
        (click)="remove.emit()"
      >
        Remover
      </button>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  readonly item = input.required<CartItemLike>();
  readonly quantityChange = output<number>();
  readonly remove = output<void>();

  protected readonly quantity = computed(() => toNumber(this.item().quantidade));
  protected readonly total = computed(() => this.quantity() * toNumber(this.item().valorUnitario));

  protected formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      toNumber(value),
    );
  }
}

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
