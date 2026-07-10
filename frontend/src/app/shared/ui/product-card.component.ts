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
        class="relative flex min-h-56 items-end overflow-hidden bg-[linear-gradient(135deg,#e0f2fe_0%,#bae6fd_45%,#0f172a_100%)] p-4"
      >
        @if (product().thumb) {
          <img
            [src]="product().thumb!"
            [alt]="product().titulo"
            class="absolute inset-0 h-full w-full object-cover"
          />
        } @else {
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.26),_transparent_55%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#bae6fd_100%)]"
            aria-hidden="true"
          ></div>
        }

        <div class="relative flex w-full items-start justify-between gap-3">
          <span
            class="text-shop-text rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase"
          >
            {{ product().categoria?.titulo ?? 'Produto' }}
          </span>
          <span
            class="bg-shop-text/85 rounded-full px-3 py-1 text-xs font-bold text-white"
          >
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

        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-shop-text-light text-xs font-bold tracking-[0.2em] uppercase">
              Preço
            </p>
            <p class="text-shop-text text-xl font-black">{{ priceLabel() }}</p>
          </div>

          <a
            [attr.href]="ctaLink()"
            class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover inline-flex rounded-full px-4 py-2 text-sm font-bold transition"
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
  readonly ctaLink = input('/products');

  protected readonly priceLabel = computed(() => this.formatCurrency(this.product().preco));
  protected readonly stockLabel = computed(() => `${this.formatStock(this.product().estoque)} em estoque`);

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
