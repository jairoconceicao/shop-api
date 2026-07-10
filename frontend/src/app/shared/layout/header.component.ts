import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="sticky top-0 z-50 border-b border-shop-border/80 bg-white/90 backdrop-blur">
      <div class="mx-auto w-full max-w-7xl px-4 py-3 lg:px-6 lg:py-4">
        <div class="flex items-center justify-between gap-4">
          <a
            routerLink="/"
            class="flex items-center gap-3 text-shop-text transition hover:text-shop-primary"
            aria-label="Ir para a pagina inicial"
          >
            <span
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-shop-primary-soft),white)] text-lg font-black text-shop-primary shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
            >
              S
            </span>
            <span>
              <strong class="block text-lg font-black tracking-tight lg:text-xl">Shop API</strong>
              <span class="block text-xs text-shop-text-muted">Storefront foundation</span>
            </span>
          </a>

          @if (isDesktop()) {
            <div class="flex flex-1 items-center gap-4">
              <label class="relative flex-1">
                <span class="sr-only">Buscar produtos</span>
                <input
                  type="search"
                  placeholder="Buscar produtos, marcas e categorias"
                  class="w-full rounded-full border border-shop-border bg-shop-background px-5 py-3 text-sm text-shop-text outline-none ring-0 transition placeholder:text-shop-text-light focus:border-shop-primary"
                />
              </label>

              <nav class="flex items-center gap-2 text-sm font-semibold">
                <a routerLink="/products" class="rounded-full px-4 py-2 text-shop-text-muted transition hover:bg-shop-primary-soft hover:text-shop-primary">Catalogo</a>
                <a routerLink="/cadastro" class="rounded-full px-4 py-2 text-shop-text-muted transition hover:bg-shop-primary-soft hover:text-shop-primary">Criar conta</a>
                <a routerLink="/cart" class="rounded-full px-4 py-2 text-shop-text-muted transition hover:bg-shop-primary-soft hover:text-shop-primary">Carrinho</a>
                <a routerLink="/account" class="rounded-full px-4 py-2 text-shop-text-muted transition hover:bg-shop-primary-soft hover:text-shop-primary">Conta</a>
                <a routerLink="/login" class="rounded-full bg-shop-primary px-5 py-2.5 text-shop-text-inverted shadow-[0_14px_30px_rgba(37,99,235,0.24)] transition hover:bg-shop-primary-hover">Entrar</a>
              </nav>
            </div>
          } @else {
            <div class="flex items-center gap-2">
              <a routerLink="/cadastro" class="rounded-full border border-shop-border px-4 py-2 text-sm font-semibold text-shop-text">Criar conta</a>
              <a routerLink="/login" class="rounded-full border border-shop-border px-4 py-2 text-sm font-semibold text-shop-text">Entrar</a>
              <a routerLink="/cart" class="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-shop-secondary-soft text-shop-secondary" aria-label="Ir para o carrinho">
                <span aria-hidden="true">cart</span>
              </a>
            </div>
          }
        </div>

        @if (!isDesktop()) {
          <div class="mt-4">
            <label class="relative block">
              <span class="sr-only">Buscar produtos</span>
              <input
                type="search"
                placeholder="Buscar produto..."
                class="w-full rounded-2xl border border-shop-border bg-shop-background px-4 py-3 text-sm text-shop-text outline-none transition placeholder:text-shop-text-light focus:border-shop-primary"
              />
            </label>
          </div>
        }
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly isDesktop = toSignal(
    this.breakpointObserver.observe('(min-width: 1024px)').pipe(map(({ matches }) => matches)),
    { initialValue: false },
  );
}
