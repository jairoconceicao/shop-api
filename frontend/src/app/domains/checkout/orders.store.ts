import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { finalize, Subscription } from 'rxjs';

import { OrderService } from '@core/order/order.service';
import type { Order, OrderListParams } from '@shared/models';

interface OrdersState {
  readonly orders: readonly Order[];
  readonly currentOrder: Order | null;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly currentPage: number;
  readonly pageSize: number;
  readonly isLoading: boolean;
  readonly isLoadingDetail: boolean;
  readonly isCancelling: boolean;
  readonly error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 20,
  isLoading: false,
  isLoadingDetail: false,
  isCancelling: false,
  error: null,
};

export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ orders, currentOrder, totalItems, totalPages, currentPage, pageSize, isLoading, isLoadingDetail, isCancelling, error }) => ({
    isEmpty: computed(() => orders().length === 0 && !isLoading()),
    hasOrders: computed(() => orders().length > 0),
    isReady: computed(() => !isLoading() && !isLoadingDetail() && !isCancelling()),
    canCancel: computed(() => {
      const order = currentOrder();
      return order !== null && order.status !== 'Cancelado' && !isCancelling();
    }),
    orders: computed(() => orders()),
    currentOrder: computed(() => currentOrder()),
    totalItems: computed(() => totalItems()),
    totalPages: computed(() => totalPages()),
    currentPage: computed(() => currentPage()),
    pageSize: computed(() => pageSize()),
    isLoading: computed(() => isLoading()),
    isLoadingDetail: computed(() => isLoadingDetail()),
    isCancelling: computed(() => isCancelling()),
    error: computed(() => error()),
  })),
  withMethods((store) => {
    const orderService = inject(OrderService);
    let listSubscription: Subscription | null = null;
    let detailSubscription: Subscription | null = null;
    let cancelSubscription: Subscription | null = null;

    return {
      loadOrders(params: OrderListParams): void {
        listSubscription?.unsubscribe();
        patchState(store, {
          isLoading: true,
          error: null,
          currentPage: params.page ?? store.currentPage(),
          pageSize: params.size ?? store.pageSize(),
        });

        listSubscription = orderService
          .list(params)
          .pipe(finalize(() => { listSubscription = null; }))
          .subscribe({
            next: (pagination) => {
              patchState(store, {
                orders: [...pagination.data],
                totalItems: pagination.totalItems,
                totalPages: pagination.pages,
                isLoading: false,
                error: null,
              });
            },
            error: () => {
              patchState(store, {
                orders: [],
                totalItems: 0,
                totalPages: 0,
                isLoading: false,
                error: 'Nao foi possivel carregar os pedidos.',
              });
            },
          });
      },

      loadOrderDetail(pedidoId: number | string): void {
        detailSubscription?.unsubscribe();
        patchState(store, {
          isLoadingDetail: true,
          error: null,
        });

        detailSubscription = orderService
          .getById(pedidoId)
          .pipe(finalize(() => { detailSubscription = null; }))
          .subscribe({
            next: (order) => {
              patchState(store, {
                currentOrder: order,
                isLoadingDetail: false,
                error: null,
              });
            },
            error: () => {
              patchState(store, {
                currentOrder: null,
                isLoadingDetail: false,
                error: 'Nao foi possivel carregar o detalhe do pedido.',
              });
            },
          });
      },

      cancelOrder(pedidoId: number | string): void {
        cancelSubscription?.unsubscribe();
        patchState(store, {
          isCancelling: true,
          error: null,
        });

        cancelSubscription = orderService
          .cancel(pedidoId)
          .pipe(finalize(() => { cancelSubscription = null; }))
          .subscribe({
            next: (canceled) => {
              patchState(store, {
                orders: store.orders().map((order) =>
                  order.pedidoId === canceled.pedidoId
                    ? { ...order, status: 'Cancelado' }
                    : order,
                ),
                currentOrder: store.currentOrder()?.pedidoId === canceled.pedidoId
                  ? { ...store.currentOrder()!, status: 'Cancelado' }
                  : store.currentOrder(),
                isCancelling: false,
                error: null,
              });
            },
            error: () => {
              patchState(store, {
                isCancelling: false,
                error: 'Nao foi possivel cancelar o pedido.',
              });
            },
          });
      },

      clearOrders(): void {
        listSubscription?.unsubscribe();
        listSubscription = null;
        patchState(store, {
          orders: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 20,
          isLoading: false,
          error: null,
        });
      },

      clearCurrentOrder(): void {
        detailSubscription?.unsubscribe();
        detailSubscription = null;
        patchState(store, {
          currentOrder: null,
          isLoadingDetail: false,
          error: null,
        });
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      reset(): void {
        listSubscription?.unsubscribe();
        detailSubscription?.unsubscribe();
        cancelSubscription?.unsubscribe();
        listSubscription = null;
        detailSubscription = null;
        cancelSubscription = null;
        patchState(store, initialState);
      },
    };
  }),
);
