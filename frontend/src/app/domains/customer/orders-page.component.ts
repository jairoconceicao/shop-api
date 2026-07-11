import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InputComponent } from '@shared/ui/base/input.component';
import { OrderStatusBadgeComponent } from '@shared/ui/customer/order-status-badge.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';
import { PageContainerComponent } from '@shared/ui/page-container.component';

import { createOrdersPageContext } from './orders-page.context';

@Component({
  selector: 'app-orders-page',
  imports: [EmptyStateComponent, InputComponent, OrderStatusBadgeComponent, PageContainerComponent, RouterLink],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-6">
        <div class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
          <span class="inline-flex rounded-full bg-shop-primary-soft px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-shop-primary">
            {{ context.eyebrow }}
          </span>

          <div class="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 class="text-3xl font-black tracking-tight text-shop-text lg:text-4xl">
                {{ context.title }}
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-shop-text-muted lg:text-base">
                {{ context.description }}
              </p>
            </div>

            <a
              routerLink="/account"
              class="inline-flex items-center justify-center rounded-2xl border border-shop-border px-5 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
            >
              {{ context.accountLinkLabel }}
            </a>
          </div>
        </div>

        <form class="rounded-[2rem] border border-shop-border bg-white p-5 shadow-soft lg:p-6" (submit)="applyFilters($event)">
          <div class="grid gap-4 md:grid-cols-2">
            <app-input
              label="Data inicial"
              type="date"
              [value]="context.dataInicio()"
              (valueChange)="context.setDataInicio($event)"
            />

            <app-input
              label="Data final"
              type="date"
              [value]="context.dataFim()"
              (valueChange)="context.setDataFim($event)"
            />
          </div>

          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            <button type="submit" class="inline-flex items-center justify-center rounded-2xl bg-shop-primary px-5 py-3 text-sm font-bold text-shop-text-inverted transition hover:bg-shop-primary-hover">
              Aplicar filtros
            </button>
            <button type="button" class="inline-flex items-center justify-center rounded-2xl border border-shop-border px-5 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary" (click)="clearFilters()">
              Limpar filtros
            </button>
          </div>
        </form>

        @if (context.isLoadingOrders()) {
          <app-empty-state
            eyebrow="Pedidos"
            title="Carregando pedidos"
            description="Estamos buscando seus pedidos mais recentes."
          />
        } @else if (context.ordersError()) {
          <app-empty-state
            eyebrow="Pedidos"
            title="Nao foi possivel carregar os pedidos"
            [description]="context.ordersError()"
          />
        } @else if (context.hasOrders()) {
          <div class="space-y-4">
            @for (order of context.orders(); track order.pedidoId) {
              <article class="rounded-[2rem] border border-shop-border bg-white p-5 shadow-soft">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">
                      Pedido #{{ order.pedidoId }}
                    </p>
                    <div class="mt-2">
                      <app-order-status-badge [status]="order.status" />
                    </div>
                    <p class="mt-1 text-sm text-shop-text-muted">
                      {{ order.dataPedido }}
                    </p>
                  </div>

                  <div class="rounded-2xl bg-shop-surface-muted px-4 py-3 text-sm font-semibold text-shop-text">
                    Forma de pagamento: {{ order.formaPagamento }}
                  </div>
                </div>

                <a
                  [routerLink]="['/account/orders', order.pedidoId]"
                  class="mt-4 inline-flex items-center justify-center rounded-2xl border border-shop-border px-4 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
                >
                  Ver detalhes
                </a>
              </article>
            }

            <div class="flex flex-col gap-2 rounded-[2rem] border border-shop-border bg-white px-5 py-4 text-sm text-shop-text-muted shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <span>
                {{ context.totalItems() }} pedido(s) encontrados
              </span>
              <span>
                Pagina {{ context.currentPage() }} de {{ context.totalPages() || 1 }}
              </span>
            </div>
          </div>
        } @else {
          <app-empty-state
            eyebrow="Pedidos"
            title="Nenhum pedido carregado ainda"
            description="Seus pedidos aparecem aqui assim que a listagem do CPF autenticado for retornada."
          />
        }
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPageComponent implements OnInit {
  protected readonly context = createOrdersPageContext();

  ngOnInit(): void {
    this.context.ensureCustomerProfileLoaded();
  }

  applyFilters(event: SubmitEvent): void {
    event.preventDefault();
  }

  clearFilters(): void {
    this.context.clearFilters();
  }
}
