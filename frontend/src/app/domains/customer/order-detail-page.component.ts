import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '@shared/ui/page-container.component';
import { EmptyStateComponent } from '@shared/ui/states/empty-state.component';

import { createOrderDetailPageContext } from './order-detail-page.context';

@Component({
  selector: 'app-order-detail-page',
  imports: [EmptyStateComponent, PageContainerComponent, RouterLink],
  template: `
    <app-page-container [wide]="true">
      <section class="space-y-6">
        <div class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-10">
          <span class="inline-flex rounded-full bg-shop-primary-soft px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-shop-primary">
            Pedido
          </span>

          <div class="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 class="text-3xl font-black tracking-tight text-shop-text lg:text-4xl">
                Detalhe do pedido #{{ context.pedidoId() }}
              </h1>
              <p class="mt-3 max-w-2xl text-sm leading-6 text-shop-text-muted lg:text-base">
                Consulte os dados do pedido, os itens comprados e o resumo do pagamento.
              </p>
            </div>

            <a
              routerLink="/account/orders"
              class="inline-flex items-center justify-center rounded-2xl border border-shop-border px-5 py-3 text-sm font-bold text-shop-text transition hover:border-shop-primary hover:text-shop-primary"
            >
              Voltar para pedidos
            </a>
          </div>
        </div>

        @if (context.isLoadingOrder()) {
          <app-empty-state
            eyebrow="Pedido"
            title="Carregando pedido"
            description="Estamos buscando os detalhes do pedido selecionado."
          />
        } @else if (context.orderError()) {
          <app-empty-state
            eyebrow="Pedido"
            title="Nao foi possivel carregar o pedido"
            [description]="context.orderError()"
          />
        } @else if (context.hasOrder()) {
          <div class="space-y-6">
            <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Status</p>
                  <p class="mt-1 text-base font-bold text-shop-text">{{ context.order()?.status }}</p>
                </div>

                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Data do pedido</p>
                  <p class="mt-1 text-base font-bold text-shop-text">{{ context.order()?.dataPedido }}</p>
                </div>

                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Pagamento</p>
                  <p class="mt-1 text-base font-bold text-shop-text">{{ context.order()?.formaPagamento }}</p>
                </div>

                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Pedido</p>
                  <p class="mt-1 text-base font-bold text-shop-text">#{{ context.order()?.pedidoId }}</p>
                </div>
              </div>
            </article>

            <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
              <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Itens do pedido</p>

              <div class="mt-5 space-y-3">
                @for (item of context.order()?.items ?? []; track item.itemId) {
                  <div class="flex flex-col gap-2 rounded-2xl border border-shop-border bg-shop-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p class="font-semibold text-shop-text">Produto #{{ item.produtoId }}</p>
                      <p class="text-sm text-shop-text-muted">Quantidade: {{ item.quantidade }}</p>
                    </div>

                    <p class="text-sm font-bold text-shop-price">
                      R$ {{ item.valorUnitario }}
                    </p>
                  </div>
                }
              </div>
            </article>

            <article class="rounded-[2rem] border border-shop-border bg-white p-6 shadow-soft lg:p-8">
              <p class="text-xs font-black uppercase tracking-[0.24em] text-shop-text-light">Endere&ccedil;o de entrega</p>

              <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Logradouro</p>
                  <p class="mt-1 font-bold text-shop-text">{{ context.order()?.enderecoEntrega?.logradouro }}</p>
                </div>
                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Numero</p>
                  <p class="mt-1 font-bold text-shop-text">{{ context.order()?.enderecoEntrega?.numero }}</p>
                </div>
                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Complemento</p>
                  <p class="mt-1 font-bold text-shop-text">{{ context.order()?.enderecoEntrega?.complemento || 'Nao informado' }}</p>
                </div>
                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Bairro</p>
                  <p class="mt-1 font-bold text-shop-text">{{ context.order()?.enderecoEntrega?.bairro }}</p>
                </div>
                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">Cidade</p>
                  <p class="mt-1 font-bold text-shop-text">{{ context.order()?.enderecoEntrega?.cidade }}</p>
                </div>
                <div class="rounded-2xl bg-shop-surface-muted p-4">
                  <p class="text-sm font-medium text-shop-text-muted">UF / CEP</p>
                  <p class="mt-1 font-bold text-shop-text">{{ context.order()?.enderecoEntrega?.uf }} - {{ context.order()?.enderecoEntrega?.cep }}</p>
                </div>
              </div>
            </article>
          </div>
        } @else {
          <app-empty-state
            eyebrow="Pedido"
            title="Pedido nao encontrado"
            description="Nenhum detalhe foi retornado para o identificador informado."
          />
        }
      </section>
    </app-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPageComponent implements OnInit, OnDestroy {
  protected readonly context = createOrderDetailPageContext();

  ngOnInit(): void {
    this.context.loadOrderDetail();
  }

  ngOnDestroy(): void {
    this.context.clearOrderDetail();
  }
}
