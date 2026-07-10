import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PageContainerComponent } from '@shared/ui/page-container.component';
import { ButtonComponent } from '@shared/ui/base/button.component';
import { ErrorStateComponent } from '@shared/ui/states/error-state.component';
import { LoadingStateComponent } from '@shared/ui/states/loading-state.component';

import { createProductDetailsState } from './product-details.context';

@Component({
  selector: 'app-product-details-page',
  imports: [
    RouterLink,
    PageContainerComponent,
    ButtonComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-8">
        <article
          class="border-shop-border shadow-soft overflow-hidden rounded-[2rem] border bg-white"
        >
          @if (isLoading()) {
            <app-loading-state
              class="block"
              eyebrow="Detalhe do produto"
              title="Carregando produto"
              description="Buscando os dados publicos do produto selecionado."
            />
          } @else if (error()) {
            <app-error-state
              class="block"
              eyebrow="Produto"
              title="Nao foi possivel carregar o produto"
              [description]="error() ?? ''"
            >
              <a
                routerLink="/products"
                class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover rounded-2xl px-5 py-3 text-sm font-bold transition"
              >
                Voltar ao catalogo
              </a>
            </app-error-state>
          } @else if (product(); as product) {
            <div class="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
              <div
                class="relative min-h-[22rem] overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#bae6fd_100%)]"
              >
                @if (product.foto) {
                  <img
                    [src]="product.foto"
                    [alt]="product.titulo"
                    class="absolute inset-0 h-full w-full object-cover"
                  />
                } @else {
                  <div
                    class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),_transparent_58%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_58%,#bae6fd_100%)]"
                    aria-hidden="true"
                  ></div>
                }

                <div
                  class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 lg:p-8"
                >
                  <span
                    class="text-shop-text rounded-full bg-white/90 px-3 py-1 text-xs font-black tracking-[0.2em] uppercase"
                  >
                    {{ product.categoria?.titulo ?? 'Produto' }}
                  </span>
                  <span class="bg-shop-text/85 rounded-full px-3 py-1 text-xs font-bold text-white">
                    {{ stockLabel(product.estoque) }}
                  </span>
                </div>
              </div>

              <div class="space-y-6 p-5 lg:p-8">
                <div class="space-y-3">
                  <p class="text-shop-text-light text-xs font-black tracking-[0.24em] uppercase">
                    Detalhe público
                  </p>
                  <h1 class="text-shop-text text-3xl font-black tracking-tight lg:text-4xl">
                    {{ product.titulo }}
                  </h1>
                  @if (product.descricao) {
                    <p class="text-shop-text-muted text-base leading-7">
                      {{ product.descricao }}
                    </p>
                  }
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="bg-shop-background rounded-[1.5rem] p-4">
                    <p class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
                      Preço
                    </p>
                    <p class="text-shop-text mt-2 text-2xl font-black">
                      {{ priceLabel(product.preco) }}
                    </p>
                  </div>

                  <div class="bg-shop-background rounded-[1.5rem] p-4">
                    <p class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
                      Categoria
                    </p>
                    <p class="text-shop-text mt-2 text-lg font-bold">
                      {{ product.categoria?.titulo ?? 'Sem categoria' }}
                    </p>
                  </div>
                </div>

                <dl class="grid gap-3 sm:grid-cols-2">
                  <div class="border-shop-border rounded-[1.5rem] border p-4">
                    <dt class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
                      Modelo
                    </dt>
                    <dd class="text-shop-text mt-2 text-sm font-semibold">
                      {{ product.modelo ?? 'Nao informado' }}
                    </dd>
                  </div>

                  <div class="border-shop-border rounded-[1.5rem] border p-4">
                    <dt class="text-shop-text-light text-xs font-bold tracking-[0.24em] uppercase">
                      Estoque
                    </dt>
                    <dd class="text-shop-text mt-2 text-sm font-semibold">
                      {{ stockLabel(product.estoque) }}
                    </dd>
                  </div>
                </dl>

                <div class="grid gap-3 sm:grid-cols-2">
                  <app-button type="button" size="lg" [block]="true">
                    Comprar agora
                  </app-button>
                  <app-button type="button" variant="outline" size="lg" [block]="true">
                    Adicionar ao carrinho
                  </app-button>
                </div>

                <div class="flex flex-wrap gap-3">
                  <a
                    routerLink="/products"
                    class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover rounded-2xl px-5 py-3 text-sm font-bold transition"
                  >
                    Voltar ao catalogo
                  </a>
                  <button
                    type="button"
                    class="border-shop-border bg-shop-background text-shop-text hover:border-shop-primary/30 hover:text-shop-primary rounded-2xl border px-5 py-3 text-sm font-bold transition"
                    (click)="reload()"
                  >
                    Recarregar
                  </button>
                </div>
              </div>
            </div>
          }
        </article>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeParamMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly productId = computed(() => parseProductId(this.routeParamMap().get('id')));
  protected readonly state = createProductDetailsState(this.productId);

  protected readonly product = this.state.product;
  protected readonly isLoading = this.state.isLoading;
  protected readonly error = this.state.error;

  protected reload(): void {
    this.state.reload();
  }

  protected priceLabel(value: number | string): string {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (!Number.isFinite(numericValue)) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  }

  protected stockLabel(value: number | string): string {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (!Number.isFinite(numericValue)) {
      return '0 em estoque';
    }

    return `${new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0,
    }).format(numericValue)} em estoque`;
  }
}

function parseProductId(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
