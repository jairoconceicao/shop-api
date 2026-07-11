import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { ProductCatalogItem } from '@shared/models';

@Component({
  selector: 'app-product-card',
  imports: [],
  template: `
    <article
      class="border-shop-border shadow-soft overflow-hidden rounded-[1.5rem] border bg-white"
    >
      <div
        class="relative flex min-h-56 items-end overflow-hidden bg-[linear-gradient(135deg,var(--color-shop-primary-soft)_0%,#eff6ff_45%,var(--color-shop-secondary-soft)_100%)] p-4"
      >
        @if (product().thumb) {
          <img
            [src]="product().thumb!"
            [alt]="product().titulo"
            class="absolute inset-0 h-full w-full object-cover"
          />
        } @else {
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.32),_transparent_55%),linear-gradient(135deg,var(--color-shop-primary)_0%,#60a5fa_55%,var(--color-shop-secondary-soft)_100%)]"
            aria-hidden="true"
          ></div>
        }

        <div class="relative flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <span
            class="text-shop-text inline-flex max-w-full rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase"
          >
            {{ product().categoria?.titulo ?? 'Produto' }}
          </span>
          <span class="bg-shop-text/85 inline-flex max-w-full rounded-full px-3 py-1 text-xs font-bold text-white">
            {{ stockLabel() }}
          </span>
        </div>
      </div>

      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <p class="text-shop-text-light text-xs font-bold tracking-[0.2em] uppercase">
            Vitrine pública
          </p>
          <h3 class="text-shop-text text-base font-bold">
            {{ product().titulo }}
          </h3>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-shop-text-light text-xs font-bold tracking-[0.2em] uppercase">Preço</p>
            <p class="text-shop-text text-xl font-black">{{ priceLabel() }}</p>
          </div>

          <a
            [attr.href]="resolvedCtaLink()"
            class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover inline-flex justify-center rounded-full px-4 py-2 text-sm font-bold transition"
          >
            {{ ctaLabel() }}
          </a>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<ProductCatalogItem>();
  readonly ctaLabel = input('Comprar');
  readonly ctaLink = input<string>();

  protected readonly priceLabel = computed(() => this.formatCurrency(this.product().preco));
  protected readonly stockLabel = computed(
    () => `${this.formatStock(this.product().estoque)} em estoque`,
  );
  protected readonly resolvedCtaLink = computed(
    () => this.ctaLink() ?? `/products/${this.product().produtoId}`,
  );

  private formatCurrency(value: number | string): string {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (!Number.isFinite(numericValue)) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  }

  private formatStock(value: number | string): string {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (!Number.isFinite(numericValue)) {
      return '0';
    }

    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0,
    }).format(numericValue);
  }
}
