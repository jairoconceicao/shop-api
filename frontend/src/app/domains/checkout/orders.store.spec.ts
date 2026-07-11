import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrderService } from '@core/order/order.service';
import type { Order } from '@shared/models';
import { resetStoreTestBed } from '../testing/store-test.context';

import { OrdersStore } from './orders.store';

describe('OrdersStore', () => {
  const orderServiceMock = {
    create: vi.fn(),
    list: vi.fn(),
    getById: vi.fn(),
    cancel: vi.fn(),
  };

  const order = (overrides: Partial<Order> = {}): Order => ({
    pedidoId: 1,
    carrinhoId: 10,
    clienteId: 7,
    enderecoEntrega: {
      logradouro: 'Rua Central',
      numero: '100',
      complemento: null,
      cep: '01001000',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      uf: 'SP',
    },
    dataPedido: '2026-07-10T12:00:00-03:00',
    formaPagamento: 'Pix',
    status: 'Criado',
    items: [
      {
        itemId: 1,
        produtoId: 10,
        quantidade: 2,
        valorUnitario: 99.9,
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    orderServiceMock.create.mockReset();
    orderServiceMock.list.mockReset();
    orderServiceMock.getById.mockReset();
    orderServiceMock.cancel.mockReset();

    TestBed.configureTestingModule({
      providers: [
        OrdersStore,
        { provide: OrderService, useValue: orderServiceMock },
      ],
    });
  });

  afterEach(() => {
    resetStoreTestBed();
  });

  it('starts with empty state and exposes derived signals', () => {
    const store = TestBed.inject(OrdersStore);

    expect(store.isEmpty()).toBe(true);
    expect(store.hasOrders()).toBe(false);
    expect(store.isReady()).toBe(true);
    expect(store.canCancel()).toBe(false);
    expect(store.orders()).toEqual([]);
    expect(store.currentOrder()).toBeNull();
    expect(store.totalItems()).toBe(0);
    expect(store.totalPages()).toBe(0);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(20);
    expect(store.isLoading()).toBe(false);
    expect(store.isLoadingDetail()).toBe(false);
    expect(store.isCancelling()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('loads orders list and updates pagination state', () => {
    const orders = [order({ pedidoId: 1 }), order({ pedidoId: 2 })];
    orderServiceMock.list.mockReturnValue(
      of({ pages: 3, size: 20, totalItems: 50, data: orders }),
    );

    const store = TestBed.inject(OrdersStore);

    store.loadOrders({ cpf: '12345678901', page: 1, size: 20 });

    expect(orderServiceMock.list).toHaveBeenCalledWith({
      cpf: '12345678901',
      page: 1,
      size: 20,
    });
    expect(store.hasOrders()).toBe(true);
    expect(store.orders()).toEqual(orders);
    expect(store.totalItems()).toBe(50);
    expect(store.totalPages()).toBe(3);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(20);
    expect(store.isLoading()).toBe(false);
    expect(store.isEmpty()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('sets error state when loading orders fails', () => {
    orderServiceMock.list.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(OrdersStore);

    store.loadOrders({ cpf: '12345678901' });

    expect(store.orders()).toEqual([]);
    expect(store.totalItems()).toBe(0);
    expect(store.totalPages()).toBe(0);
    expect(store.isLoading()).toBe(false);
    expect(store.isEmpty()).toBe(true);
    expect(store.error()).toBe('Nao foi possivel carregar os pedidos.');
  });

  it('loads order detail and sets current order', () => {
    const detail = order({ pedidoId: 42 });
    orderServiceMock.getById.mockReturnValue(of(detail));

    const store = TestBed.inject(OrdersStore);

    store.loadOrderDetail(42);

    expect(orderServiceMock.getById).toHaveBeenCalledWith(42);
    expect(store.currentOrder()).toEqual(detail);
    expect(store.isLoadingDetail()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('sets error state when loading order detail fails', () => {
    orderServiceMock.getById.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(OrdersStore);

    store.loadOrderDetail(999);

    expect(store.currentOrder()).toBeNull();
    expect(store.isLoadingDetail()).toBe(false);
    expect(store.error()).toBe('Nao foi possivel carregar o detalhe do pedido.');
  });

  it('cancels an order and updates both list and current order', () => {
    const canceledOrder = {
      pedidoId: 42,
      clienteId: 7,
      dataPedido: '2026-07-10T12:00:00-03:00',
      status: 'Cancelado' as const,
    };
    orderServiceMock.cancel.mockReturnValue(of(canceledOrder));

    const store = TestBed.inject(OrdersStore);

    const existingOrder = order({ pedidoId: 42, status: 'Criado' });
    orderServiceMock.list.mockReturnValue(
      of({ pages: 1, size: 20, totalItems: 1, data: [existingOrder] }),
    );
    orderServiceMock.getById.mockReturnValue(of(existingOrder));
    store.loadOrders({ cpf: '12345678901' });
    store.loadOrderDetail(42);

    store.cancelOrder(42);

    expect(orderServiceMock.cancel).toHaveBeenCalledWith(42);
    expect(store.isCancelling()).toBe(false);
    expect(store.currentOrder()?.status).toBe('Cancelado');
    expect(store.orders()[0].status).toBe('Cancelado');
    expect(store.error()).toBeNull();
  });

  it('sets error state when canceling order fails', () => {
    orderServiceMock.cancel.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(OrdersStore);

    store.cancelOrder(42);

    expect(store.isCancelling()).toBe(false);
    expect(store.error()).toBe('Nao foi possivel cancelar o pedido.');
  });

  it('allows cancel only when current order is not already canceled', () => {
    const store = TestBed.inject(OrdersStore);

    expect(store.canCancel()).toBe(false);

    const activeOrder = order({ pedidoId: 1, status: 'Criado' });
    orderServiceMock.getById.mockReturnValue(of(activeOrder));
    store.loadOrderDetail(1);

    expect(store.canCancel()).toBe(true);

    const canceledOrder = order({ pedidoId: 1, status: 'Cancelado' });
    orderServiceMock.getById.mockReturnValue(of(canceledOrder));
    store.loadOrderDetail(1);

    expect(store.canCancel()).toBe(false);
  });

  it('clears orders list and resets pagination', () => {
    const store = TestBed.inject(OrdersStore);

    orderServiceMock.list.mockReturnValue(
      of({ pages: 2, size: 10, totalItems: 15, data: [order()] }),
    );
    store.loadOrders({ cpf: '12345678901', page: 2, size: 10 });

    store.clearOrders();

    expect(store.orders()).toEqual([]);
    expect(store.totalItems()).toBe(0);
    expect(store.totalPages()).toBe(0);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(20);
    expect(store.isEmpty()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it('clears current order and resets detail state', () => {
    const store = TestBed.inject(OrdersStore);

    orderServiceMock.getById.mockReturnValue(of(order()));
    store.loadOrderDetail(1);

    store.clearCurrentOrder();

    expect(store.currentOrder()).toBeNull();
    expect(store.isLoadingDetail()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('clears error state independently', () => {
    orderServiceMock.list.mockReturnValue(throwError(() => new Error('fail')));

    const store = TestBed.inject(OrdersStore);

    store.loadOrders({ cpf: '12345678901' });
    expect(store.error()).not.toBeNull();

    store.clearError();
    expect(store.error()).toBeNull();
  });

  it('keeps pagination defaults when clearing the orders list', () => {
    const store = TestBed.inject(OrdersStore);

    orderServiceMock.list.mockReturnValue(
      of({ pages: 2, size: 10, totalItems: 15, data: [order()] }),
    );
    store.loadOrders({ cpf: '12345678901', page: 2, size: 10 });

    store.clearOrders();

    expect(store.orders()).toEqual([]);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(20);
    expect(store.totalItems()).toBe(0);
    expect(store.totalPages()).toBe(0);
  });

  it('resets the entire state to initial values', () => {
    const store = TestBed.inject(OrdersStore);

    orderServiceMock.list.mockReturnValue(
      of({ pages: 1, size: 20, totalItems: 1, data: [order()] }),
    );
    store.loadOrders({ cpf: '12345678901' });
    orderServiceMock.getById.mockReturnValue(of(order()));
    store.loadOrderDetail(1);

    store.reset();

    expect(store.orders()).toEqual([]);
    expect(store.currentOrder()).toBeNull();
    expect(store.totalItems()).toBe(0);
    expect(store.totalPages()).toBe(0);
    expect(store.currentPage()).toBe(1);
    expect(store.pageSize()).toBe(20);
    expect(store.isLoading()).toBe(false);
    expect(store.isLoadingDetail()).toBe(false);
    expect(store.isCancelling()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.isEmpty()).toBe(true);
    expect(store.isReady()).toBe(true);
  });
});
