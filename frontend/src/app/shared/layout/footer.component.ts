import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="border-t border-shop-border bg-shop-surface">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-shop-text-muted lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div class="max-w-xl">
          <p class="text-base font-bold text-shop-text">Shop API</p>
          <p class="mt-2">
            Base Angular 22 com Tailwind v4 e Angular CDK, organizada para evoluir catalogo, checkout e area autenticada.
          </p>
        </div>

        <div class="flex flex-wrap gap-3 font-semibold">
          <a routerLink="/products" class="rounded-full bg-shop-surface-muted px-4 py-2 text-shop-text transition hover:text-shop-primary">Catalogo</a>
          <a routerLink="/login" class="rounded-full bg-shop-surface-muted px-4 py-2 text-shop-text transition hover:text-shop-primary">Login</a>
          <a routerLink="/account" class="rounded-full bg-shop-surface-muted px-4 py-2 text-shop-text transition hover:text-shop-primary">Conta</a>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
