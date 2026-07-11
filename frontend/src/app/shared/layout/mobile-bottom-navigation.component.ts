import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mobile-bottom-navigation',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-shop-border bg-shop-surface/95 px-2 py-2 backdrop-blur lg:hidden" aria-label="Navegacao principal mobile">
      <div class="mx-auto grid max-w-md grid-cols-4 gap-1 text-center text-[0.7rem] font-medium">
        <a routerLink="/" [routerLinkActive]="['bg-shop-primary-soft', 'text-shop-primary']" [routerLinkActiveOptions]="{ exact: true }" class="flex min-h-14 items-center justify-center rounded-2xl px-2 py-3 text-shop-text-muted transition">Inicio</a>
        <a routerLink="/products" [routerLinkActive]="['bg-shop-primary-soft', 'text-shop-primary']" class="flex min-h-14 items-center justify-center rounded-2xl px-2 py-3 text-shop-text-muted transition">Busca</a>
        <a routerLink="/cart" [routerLinkActive]="['bg-shop-primary-soft', 'text-shop-primary']" class="flex min-h-14 items-center justify-center rounded-2xl px-2 py-3 text-shop-text-muted transition">Carrinho</a>
        <a routerLink="/account" [routerLinkActive]="['bg-shop-primary-soft', 'text-shop-primary']" class="flex min-h-14 items-center justify-center rounded-2xl px-2 py-3 text-shop-text-muted transition">Conta</a>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileBottomNavigationComponent {}
