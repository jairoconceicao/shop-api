import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-button',
  imports: [RouterLink],
  template: `
    <a
      routerLink="/cart"
      class="relative inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-shop-secondary-soft px-4 text-sm font-bold text-shop-secondary transition hover:bg-shop-secondary hover:text-shop-text-inverted"
      aria-label="Ir para o carrinho"
    >
      <span aria-hidden="true">Carrinho</span>
      @if (count() > 0) {
        <span class="inline-flex min-w-6 items-center justify-center rounded-full bg-shop-secondary px-2 py-0.5 text-xs font-black text-shop-text-inverted">
          {{ count() }}
        </span>
      }
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartButtonComponent {
  readonly count = input(0);
}
