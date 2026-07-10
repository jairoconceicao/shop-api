import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoryService } from '@core/category/category.service';
import { CatalogService } from '@core/catalog/catalog.service';
import type { Category } from '@shared/models';
import { PageContainerComponent } from '@shared/ui/page-container.component';
import { ProductCardComponent } from '@shared/ui/product-card.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';
import { ErrorStateComponent } from '@shared/ui/states/error-state.component';
import { LoadingStateComponent } from '@shared/ui/states/loading-state.component';

import { createRemoteSectionState } from './home-page.context';
import { createIncrementalSectionState } from './home-featured-products.context';

@Component({
  selector: 'app-home-page',
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
          class="border-shop-border shadow-soft overflow-hidden rounded-[2rem] border bg-[linear-gradient(135deg,#08121f_0%,#10243d_55%,#dbeafe_100%)] px-5 py-6 text-white sm:px-6 lg:px-10 lg:py-10"
        >
          <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span
                class="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.24em] text-white/80 uppercase"
              >
                Ofertas da semana
              </span>
              <h1
                class="mt-4 max-w-2xl text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl"
              >
                Sua vitrine mobile first para descobrir, comparar e comprar mais rapido.
              </h1>
              <p class="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Uma home pensada para o celular primeiro, com caminhos curtos para categorias,
                promoções e produtos em destaque.
              </p>
              <div class="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  routerLink="/products"
                  class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold shadow-[0_18px_38px_rgba(37,99,235,0.28)] transition"
                >
                  Explorar vitrine
                </a>
                <a
                  routerLink="/login"
                  class="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Entrar
                </a>
              </div>
              <dl class="mt-8 grid gap-3 sm:grid-cols-3">
                <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <dt class="text-xs font-bold tracking-[0.24em] text-white/55 uppercase">
                    Entrega
                  </dt>
                  <dd class="mt-2 text-lg font-bold text-white">Rápida e rastreada</dd>
                </div>
                <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <dt class="text-xs font-bold tracking-[0.24em] text-white/55 uppercase">
                    Parcelamento
                  </dt>
                  <dd class="mt-2 text-lg font-bold text-white">Até 12x sem surpresa</dd>
                </div>
                <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <dt class="text-xs font-bold tracking-[0.24em] text-white/55 uppercase">
                    Atendimento
                  </dt>
                  <dd class="mt-2 text-lg font-bold text-white">Suporte antes e depois</dd>
                </div>
              </dl>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 lg:max-w-xl lg:justify-self-end">
              @for (shortcut of shortcuts; track shortcut.title) {
                <a
                  [routerLink]="shortcut.link"
                  class="group rounded-[1.75rem] border border-white/12 bg-white/10 p-4 transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <div class="flex items-start justify-between gap-3">
                    <span
                      class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-lg font-black text-white"
                    >
                      {{ shortcut.badge }}
                    </span>
                    <span
                      class="rounded-full bg-white/10 px-2.5 py-1 text-[0.7rem] font-bold tracking-[0.2em] text-white/60 uppercase"
                    >
                      {{ shortcut.label }}
                    </span>
                  </div>
                  <h2 class="mt-4 text-lg font-bold text-white">{{ shortcut.title }}</h2>
                  <p class="mt-2 text-sm leading-6 text-white/70">{{ shortcut.description }}</p>
                </a>
              }
            </div>
          </div>
        </article>

        <section class="space-y-4">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                Categorias
              </p>
              <h2 class="text-shop-text mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Navegue por categoria
              </h2>
            </div>
          </div>

          @if (categoriesState.isLoading()) {
            <app-loading-state
              class="block"
              eyebrow="Carregando categorias"
              title="Preparando a navegação"
              description="Buscando as categorias públicas para montar os atalhos da home."
            />
          } @else if (categoriesState.error()) {
            <app-error-state
              class="block"
              eyebrow="Falha nas categorias"
              title="Nao foi possivel carregar as categorias"
              description="Tente novamente para atualizar os atalhos da home."
              [details]="categoriesState.error() ?? ''"
            >
              <button
                type="button"
                class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
                (click)="reloadCategories()"
              >
                Recarregar categorias
              </button>
            </app-error-state>
          } @else if (categoriesState.isEmpty()) {
            <app-empty-state
              class="block"
              eyebrow="Sem categorias"
              title="Nenhuma categoria disponivel"
              description="Assim que a API retornar categorias publicas, elas aparecem aqui."
            >
              <a
                routerLink="/products"
                class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
              >
                Explorar produtos
              </a>
            </app-empty-state>
          } @else {
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              @for (category of categories(); track category.title) {
                <a
                  [routerLink]="category.link"
                  class="border-shop-border shadow-soft hover:border-shop-primary/30 rounded-[1.5rem] border bg-white p-4 transition hover:-translate-y-0.5"
                >
                  <span
                    class="bg-shop-secondary-soft text-shop-secondary inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase"
                  >
                    {{ category.tag }}
                  </span>
                  <h3 class="text-shop-text mt-4 text-lg font-bold">{{ category.title }}</h3>
                  <p class="text-shop-text-muted mt-2 text-sm leading-6">{{ category.description }}</p>
                </a>
              }
            </div>
          }
        </section>

        <section class="space-y-4">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                Vitrine
              </p>
              <h2 class="text-shop-text mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Produtos em destaque
              </h2>
            </div>
            <a
              routerLink="/products"
              class="text-shop-primary hover:text-shop-primary-hover hidden text-sm font-bold transition sm:inline-flex"
            >
              Ver tudo
            </a>
          </div>

          @if (featuredProductsState.isLoading()) {
            <app-loading-state
              eyebrow="Carregando vitrine"
              title="Preparando os produtos"
              description="Buscando os produtos públicos em destaque para exibir na home."
            />
          } @else if (featuredProductsState.error()) {
            <app-error-state
              eyebrow="Falha na vitrine"
              title="Nao foi possivel carregar os produtos"
              description="Tente novamente para atualizar a vitrine em destaque."
              [details]="featuredProductsState.error() ?? ''"
            >
              <button
                type="button"
                class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
                (click)="reloadFeaturedProducts()"
              >
                Recarregar vitrine
              </button>
            </app-error-state>
          } @else if (featuredProductsState.isEmpty()) {
            <app-empty-state
              eyebrow="Vitrine vazia"
              title="Nenhum produto em destaque"
              description="A API ainda nao retornou produtos publicos para esta vitrine."
            >
              <a
                routerLink="/products"
                class="rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover"
              >
                Explorar produtos
              </a>
            </app-empty-state>
          } @else {
            <div class="space-y-4">
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                @for (product of featuredProducts(); track product.produtoId) {
                  <app-product-card [product]="product" />
                }
              </div>

              @if (featuredProductsState.loadMoreError()) {
                <div class="border-shop-border rounded-[1.5rem] border bg-white p-4">
                  <p class="text-shop-text font-bold">Nao foi possivel carregar mais produtos.</p>
                  <p class="text-shop-text-muted mt-1 text-sm">
                    {{ featuredProductsState.loadMoreError() }}
                  </p>
                  <button
                    type="button"
                    class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover mt-4 inline-flex rounded-2xl px-5 py-3 text-sm font-bold transition"
                    (click)="loadMoreFeaturedProducts()"
                  >
                    Tentar novamente
                  </button>
                </div>
              } @else if (featuredProductsState.hasMore()) {
                <div class="flex justify-center pt-2">
                  <button
                    type="button"
                    class="border-shop-border bg-shop-background text-shop-text hover:border-shop-primary/30 hover:text-shop-primary inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70"
                    [disabled]="featuredProductsState.isLoadingMore()"
                    (click)="loadMoreFeaturedProducts()"
                  >
                    @if (featuredProductsState.isLoadingMore()) {
                      Carregando mais produtos...
                    } @else {
                      Ver mais produtos
                    }
                  </button>
                </div>
              }
            </div>
          }
        </section>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly categoryService = inject(CategoryService);

  readonly shortcuts = [
    {
      badge: '1',
      label: 'Mais buscado',
      title: 'Celulares e acessórios',
      description: 'Da entrada ao topo de linha, com atalhos para capas, carregadores e fones.',
      link: '/products',
    },
    {
      badge: '2',
      label: 'Promo',
      title: 'Notebook e periféricos',
      description: 'Para estudo, trabalho e setup gamer, já no primeiro scroll.',
      link: '/products',
    },
    {
      badge: '3',
      label: 'Achadinhos',
      title: 'Casa e utilidades',
      description: 'Itens para rotina, organização e presente rápido.',
      link: '/products',
    },
    {
      badge: '4',
      label: 'Flash sale',
      title: 'Ofertas relâmpago',
      description: 'Seleção com urgência visual para destacar preço e volume de compra.',
      link: '/products',
    },
  ] as const;

  protected readonly categoriesState = createRemoteSectionState<Category>(
    () => this.categoryService.listPublicCategories(),
    'Nao foi possivel carregar as categorias. Tente novamente.',
  );

  protected readonly categories = computed(() =>
    this.categoriesState.items().map((category, index) => ({
      tag: `Top ${index + 1}`,
      title: category.titulo,
      description: category.descricao,
      link: '/products',
    })),
  );

  protected readonly featuredProductsState = createIncrementalSectionState(
    ({ page, size }) => this.catalogService.listPublicProducts({ page, size }),
    'Nao foi possivel carregar os produtos em destaque. Tente novamente.',
  );

  protected readonly featuredProducts = computed(() => this.featuredProductsState.items());

  protected reloadCategories(): void {
    this.categoriesState.reload();
  }

  protected reloadFeaturedProducts(): void {
    this.featuredProductsState.reload();
  }

  protected loadMoreFeaturedProducts(): void {
    this.featuredProductsState.loadMore();
  }
}
