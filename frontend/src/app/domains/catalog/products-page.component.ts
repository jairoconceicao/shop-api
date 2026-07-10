import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '@shared/ui/page-container.component';
import { ProductCardComponent } from '@shared/ui/product-card.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';
import { ErrorStateComponent } from '@shared/ui/states/error-state.component';
import { LoadingStateComponent } from '@shared/ui/states/loading-state.component';

import { createProductsCatalogState } from './products-page.context';

@Component({
  selector: 'app-products-page',
  imports: [
    RouterLink,
    PageContainerComponent,
    ProductCardComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-8">
        <article
          class="border-shop-border shadow-soft overflow-hidden rounded-[2rem] border bg-[linear-gradient(135deg,#08121f_0%,#10243d_55%,#dbeafe_100%)] px-5 py-6 text-white lg:px-10 lg:py-10"
        >
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl">
              <span
                class="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.24em] text-white/80 uppercase"
              >
                Catalogo publico
              </span>
              <h1 class="mt-4 text-4xl font-black tracking-tight text-balance sm:text-5xl">
                Explore produtos com navegação direta para compra.
              </h1>
              <p class="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                A rota de catálogo exibe os produtos públicos da API com uma experiência
                mobile first e acesso rápido ao detalhe de cada item.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-3 lg:w-[28rem]">
              @for (metric of metrics; track metric.label) {
                <div class="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-sm">
                  <p class="text-xs font-bold tracking-[0.24em] text-white/55 uppercase">
                    {{ metric.label }}
                  </p>
                  <p class="mt-2 text-lg font-bold text-white">{{ metric.value() }}</p>
                </div>
              }
            </div>
          </div>
        </article>

        @if (productsState.isLoading()) {
          <app-loading-state
            class="block"
            eyebrow="Carregando catalogo"
            title="Preparando os produtos"
            description="Buscando os produtos publicos para montar a vitrine do catalogo."
          />
        } @else if (productsState.error()) {
          <app-error-state
            class="block"
            eyebrow="Falha no catalogo"
            title="Nao foi possivel carregar os produtos"
            description="Tente novamente para atualizar a listagem publica."
            [details]="productsState.error() ?? ''"
          >
            <button
              type="button"
              class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
              (click)="reloadProducts()"
            >
              Recarregar catalogo
            </button>
          </app-error-state>
        } @else if (productsState.isEmpty()) {
          <app-empty-state
            class="block"
            eyebrow="Catalogo vazio"
            title="Nenhum produto disponivel"
            description="Assim que a API retornar produtos publicos, eles aparecerao aqui."
          >
            <a
              routerLink="/"
              class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
            >
              Voltar para home
            </a>
          </app-empty-state>
        } @else {
          <section class="space-y-4">
            <div class="flex items-end justify-between gap-4">
              <div>
                <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                  Produtos
                </p>
                <h2 class="text-shop-text mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Seleção pública
                </h2>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              @for (product of products(); track product.produtoId) {
                <app-product-card [product]="product" ctaLabel="Ver produto" />
              }
            </div>

            @if (productsState.loadMoreError()) {
              <div class="border-shop-border rounded-[1.5rem] border bg-white p-4">
                <p class="text-shop-text font-bold">Nao foi possivel carregar mais produtos.</p>
                <p class="text-shop-text-muted mt-1 text-sm">
                  {{ productsState.loadMoreError() }}
                </p>
                <button
                  type="button"
                  class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover mt-4 inline-flex rounded-2xl px-5 py-3 text-sm font-bold transition"
                  (click)="loadMoreProducts()"
                >
                  Tentar novamente
                </button>
              </div>
            } @else if (productsState.hasMore()) {
              <div class="flex justify-center pt-2">
                <button
                  type="button"
                  class="border-shop-border bg-shop-background text-shop-text hover:border-shop-primary/30 hover:text-shop-primary inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70"
                  [disabled]="productsState.isLoadingMore()"
                  (click)="loadMoreProducts()"
                >
                  @if (productsState.isLoadingMore()) {
                    Carregando mais produtos...
                  } @else {
                    Ver mais produtos
                  }
                </button>
              </div>
            }
          </section>
        }
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPageComponent {
  private readonly productsState = createProductsCatalogState();

  protected readonly products = computed(() => this.productsState.items());

  protected readonly metrics = [
    {
      label: 'Itens carregados',
      value: () => `${this.products().length}`,
    },
    {
      label: 'Página',
      value: () => (this.productsState.isLoading() ? '...' : this.productsState.hasMore() ? 'Ativa' : 'Final'),
    },
    {
      label: 'Acesso',
      value: () => 'Publico',
    },
  ] as const;

  protected reloadProducts(): void {
    this.productsState.reload();
  }

  protected loadMoreProducts(): void {
    this.productsState.loadMore();
  }
}
