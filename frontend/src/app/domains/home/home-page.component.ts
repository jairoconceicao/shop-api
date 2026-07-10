import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { CatalogService } from '@core/catalog/catalog.service';
import { PageContainerComponent } from '@shared/ui/page-container.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, PageContainerComponent],
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

        <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (category of categories; track category.title) {
            <a
              [routerLink]="category.link"
              class="border-shop-border shadow-soft hover:border-shop-primary/30 rounded-[1.5rem] border bg-white p-4 transition hover:-translate-y-0.5"
            >
              <span
                class="bg-shop-secondary-soft text-shop-secondary inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase"
              >
                {{ category.tag }}
              </span>
              <h2 class="text-shop-text mt-4 text-lg font-bold">{{ category.title }}</h2>
              <p class="text-shop-text-muted mt-2 text-sm leading-6">{{ category.description }}</p>
            </a>
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

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            @for (product of featuredProducts(); track product.produtoId) {
              <article
                class="border-shop-border shadow-soft overflow-hidden rounded-[1.5rem] border bg-white"
              >
                <div
                  class="relative flex h-40 items-end overflow-hidden bg-[linear-gradient(135deg,#e0f2fe_0%,#bae6fd_45%,#0f172a_100%)] p-4"
                  [style.background-image]="product.thumb ? 'none' : null"
                >
                  @if (product.thumb) {
                    <img
                      [src]="product.thumb"
                      [alt]="product.titulo"
                      class="absolute inset-0 h-full w-full object-cover"
                    />
                  }
                  <span
                    class="text-shop-text rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase"
                  >
                    {{ product.categoria?.titulo ?? 'Produto' }}
                  </span>
                  <div
                    class="bg-shop-text/85 absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white"
                  >
                    {{ formatStock(product.estoque) }} em estoque
                  </div>
                </div>
                <div class="space-y-3 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-shop-text-light text-xs font-bold tracking-[0.2em] uppercase">
                        {{ product.categoria?.titulo ?? 'Catálogo público' }}
                      </p>
                      <h3 class="text-shop-text mt-1 text-base font-bold">{{ product.titulo }}</h3>
                    </div>
                  </div>
                  <div class="flex items-end justify-between gap-3">
                    <div>
                      <p class="text-shop-text-light text-xs font-bold tracking-[0.2em] uppercase">
                        Preço
                      </p>
                      <p class="text-shop-text text-xl font-black">{{ formatPrice(product.preco) }}</p>
                    </div>
                    <a
                      routerLink="/products"
                      class="bg-shop-primary text-shop-text-inverted hover:bg-shop-primary-hover inline-flex rounded-full px-4 py-2 text-sm font-bold transition"
                    >
                      Comprar
                    </a>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly catalogService = inject(CatalogService);

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

  readonly categories = [
    {
      tag: 'Top 1',
      title: 'Informática',
      description: 'Notebooks, monitores, periféricos e acessórios para produção e lazer.',
      link: '/products',
    },
    {
      tag: 'Top 2',
      title: 'Celulares',
      description: 'Smartphones, capas, películas, cabos e carregadores para o dia a dia.',
      link: '/products',
    },
    {
      tag: 'Top 3',
      title: 'Casa',
      description: 'Organização, cozinha e pequenos eletros para agilizar a rotina.',
      link: '/products',
    },
    {
      tag: 'Top 4',
      title: 'Games',
      description: 'Consoles, headsets, controles e tudo para jogar melhor.',
      link: '/products',
    },
  ] as const;

  private readonly featuredProductsResponse = toSignal(
    this.catalogService.listPublicProducts().pipe(
      catchError(() =>
        of({
          status: true,
          message: '',
          pagination: {
            pages: 0,
            size: 4,
            totalItems: 0,
            data: [],
          },
        }),
      ),
    ),
    {
      initialValue: {
        status: true,
        message: '',
        pagination: {
          pages: 0,
          size: 4,
          totalItems: 0,
          data: [],
        },
      },
    },
  );

  protected readonly featuredProducts = computed(() => this.featuredProductsResponse().pagination.data);

  protected formatPrice(value: number | string): string {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (!Number.isFinite(numericValue)) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  }

  protected formatStock(value: number | string): string {
    const numericValue = typeof value === 'string' ? Number(value) : value;

    if (!Number.isFinite(numericValue)) {
      return '0';
    }

    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0,
    }).format(numericValue);
  }
}
