import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { ButtonComponent } from '@shared/ui/base/button.component';
import { InputComponent } from '@shared/ui/base/input.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';
import { ProductCardComponent } from '@shared/ui/product-card.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';
import { ErrorStateComponent } from '@shared/ui/states/error-state.component';
import { LoadingStateComponent } from '@shared/ui/states/loading-state.component';

import { createProductsPageFiltersState } from './products-page-filters.context';
import { createProductsPagePaginationState } from './products-page-pagination.context';
import { createProductsCatalogState } from './products-page.context';

@Component({
  selector: 'app-products-page',
  imports: [
    RouterLink,
    PageContainerComponent,
    InputComponent,
    ButtonComponent,
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

              <form class="mt-8 max-w-3xl" (submit)="handleSearch($event)">
                <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <app-input
                    label="Buscar produtos"
                    type="search"
                    autocomplete="off"
                    placeholder="Procure por nome, marca ou categoria"
                    [value]="searchword()"
                    (valueChange)="setSearchword($event)"
                  />

                  <app-button type="submit" size="lg" variant="secondary" [block]="true">
                    Buscar
                  </app-button>
                </div>
              </form>
            </div>

            <dl class="grid gap-3 sm:grid-cols-3 lg:w-[28rem]">
              @for (metric of metrics; track metric.label) {
                <div
                  class="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-sm"
                  [attr.aria-label]="metric.ariaLabel()"
                >
                  <dt class="text-xs font-bold tracking-[0.24em] text-white/55 uppercase">
                    {{ metric.label }}
                  </dt>
                  <dd class="mt-2 text-lg font-bold text-white">{{ metric.value() }}</dd>
                </div>
              }
            </dl>
          </div>
        </article>

        <section class="space-y-4">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-shop-text-light text-sm font-bold tracking-[0.24em] uppercase">
                Categorias
              </p>
              <h2 class="text-shop-text mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Filtrar por categoria
              </h2>
            </div>

            @if (selectedCategoryLabel()) {
              <span class="text-shop-text-muted hidden text-sm font-medium sm:inline-flex">
                Filtrando por {{ selectedCategoryLabel() }}
              </span>
            }
          </div>

          @if (categoriesState.isLoadingCategories()) {
            <div class="border-shop-border rounded-[1.5rem] border bg-white p-4">
              <p class="text-shop-text font-bold">Carregando categorias...</p>
              <p class="text-shop-text-muted mt-1 text-sm">
                Buscando as categorias publicas para montar os filtros do catalogo.
              </p>
            </div>
          } @else if (categoriesState.categoriesError()) {
            <div class="border-shop-border rounded-[1.5rem] border bg-white p-4">
              <p class="text-shop-text font-bold">Nao foi possivel carregar as categorias.</p>
              <p class="text-shop-text-muted mt-1 text-sm">
                {{ categoriesState.categoriesError() }}
              </p>
              <button
                type="button"
                class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover mt-4 inline-flex rounded-2xl px-5 py-3 text-sm font-bold transition"
                (click)="reloadCategories()"
              >
                Recarregar categorias
              </button>
            </div>
          } @else {
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                [class]="selectedCategoryId() === null
                  ? 'bg-shop-primary text-shop-text-inverted shadow-soft inline-flex rounded-full px-4 py-2 text-sm font-bold transition'
                  : 'border-shop-border bg-shop-background text-shop-text hover:border-shop-primary/30 hover:text-shop-primary inline-flex rounded-full border px-4 py-2 text-sm font-bold transition'"
                [attr.aria-pressed]="selectedCategoryId() === null"
                (click)="selectCategory(null)"
              >
                Todas
              </button>

              @for (category of categories(); track category.categoriaId) {
                <button
                  type="button"
                  [class]="selectedCategoryId() === category.categoriaId
                    ? 'bg-shop-primary text-shop-text-inverted shadow-soft inline-flex rounded-full px-4 py-2 text-sm font-bold transition'
                    : 'border-shop-border bg-shop-background text-shop-text hover:border-shop-primary/30 hover:text-shop-primary inline-flex rounded-full border px-4 py-2 text-sm font-bold transition'"
                  [attr.aria-pressed]="selectedCategoryId() === category.categoriaId"
                  (click)="selectCategory(category.categoriaId)"
                >
                  {{ category.titulo }}
                </button>
              }
            </div>
          }
        </section>

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
        } @else if (isFilteredEmpty()) {
          <app-empty-state
            class="block"
            [eyebrow]="emptyStateEyebrow()"
            [title]="emptyStateTitle()"
            [description]="emptyStateDescription()"
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
              @for (product of filteredProducts(); track product.produtoId) {
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly initialSearchword = this.route.snapshot.queryParamMap.get('searchword') ?? '';
  private readonly initialCategoryId = parseCategoryId(this.route.snapshot.queryParamMap.get('categoriaId'));
  private readonly categoriesState = createProductsPageFiltersState(this.initialCategoryId);
  private readonly productsState = createProductsCatalogState(
    this.categoriesState.selectedCategoryId,
    this.initialSearchword,
  );
  private readonly paginationState = createProductsPagePaginationState(
    this.productsState.pagination,
    this.productsState.isLoading,
  );
  private readonly syncQueryParams = effect(() => {
    const queryParamMap = this.queryParamMap();
    const nextSearchword = queryParamMap.get('searchword') ?? '';
    const nextCategoryId = parseCategoryId(queryParamMap.get('categoriaId'));
    const currentSearchword = untracked(() => this.productsState.searchword());
    const currentCategoryId = untracked(() => this.categoriesState.selectedCategoryId());

    if (currentSearchword !== nextSearchword) {
      this.productsState.setSearchword(nextSearchword);
    }

    if (currentCategoryId !== nextCategoryId) {
      this.categoriesState.selectCategory(nextCategoryId);
    }

    if (currentSearchword !== nextSearchword || currentCategoryId !== nextCategoryId) {
      this.productsState.reload();
    }
  });

  protected readonly products = computed(() => this.productsState.items());
  protected readonly categories = this.categoriesState.categories;
  protected readonly searchword = this.productsState.searchword;
  protected readonly selectedCategoryId = this.categoriesState.selectedCategoryId;
  protected readonly filteredProducts = this.products;
  protected readonly isFilteredEmpty = computed(
    () => !this.productsState.isLoading() && !this.productsState.error() && this.products().length === 0,
  );
  protected readonly selectedCategoryLabel = computed(() => {
    const categoryId = this.selectedCategoryId();

    if (categoryId === null) {
      return null;
    }

    return this.categories().find((category) => category.categoriaId === categoryId)?.titulo ?? null;
  });
  protected readonly hasSearchword = computed(() => this.searchword().trim().length > 0);
  protected readonly emptyStateEyebrow = computed(() =>
    this.hasSearchword()
      ? 'Busca vazia'
      : this.selectedCategoryLabel()
        ? 'Categoria vazia'
        : 'Catalogo vazio',
  );
  protected readonly emptyStateTitle = computed(() =>
    this.hasSearchword()
      ? `Nenhum resultado para "${this.searchword().trim()}"`
      : this.selectedCategoryLabel()
        ? `Nenhum produto em ${this.selectedCategoryLabel()}`
        : 'Nenhum produto disponivel',
  );
  protected readonly emptyStateDescription = computed(() =>
    this.hasSearchword()
      ? 'Tente usar outro termo ou limpe a busca para voltar ao catalogo completo.'
      : this.selectedCategoryLabel()
        ? 'Essa categoria ainda nao retornou produtos publicos. Tente outra categoria ou volte para todas.'
      : 'Assim que a API retornar produtos publicos, eles aparecerao aqui.',
  );

  protected readonly metrics = this.paginationState.metrics;

  protected handleSearch(event: Event): void {
    event.preventDefault();
    void this.router.navigate(['/products'], {
      queryParams: buildCatalogQueryParams(this.searchword(), this.selectedCategoryId()),
      queryParamsHandling: 'merge',
    });
    this.reloadProducts();
  }

  protected setSearchword(value: string): void {
    this.productsState.setSearchword(value);
  }

  protected selectCategory(categoryId: number | null): void {
    this.categoriesState.selectCategory(categoryId);
    void this.router.navigate(['/products'], {
      queryParams: buildCatalogQueryParams(this.searchword(), categoryId),
      queryParamsHandling: 'merge',
    });
    this.productsState.reload();
  }

  protected reloadProducts(): void {
    this.productsState.reload();
  }

  protected reloadCategories(): void {
    this.categoriesState.reloadCategories();
  }

  protected loadMoreProducts(): void {
    this.productsState.loadMore();
  }
}

function parseCategoryId(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function buildCatalogQueryParams(searchword: string, categoryId: number | null): Params {
  return {
    searchword: normalizeQueryParam(searchword),
    categoriaId: categoryId,
  };
}

function normalizeQueryParam(value: string): string | null {
  const normalized = value.trim();

  return normalized ? normalized : null;
}
