import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { OrdersStore } from '../checkout/orders.store';
import { createOrderDetailPageContext } from './order-detail-page.context';

describe('createOrderDetailPageContext', () => {
  it('loads the order detail from the route parameter', () => {
    const ordersStoreMock = {
      loadOrderDetail: vi.fn(),
      clearCurrentOrder: vi.fn(),
      currentOrder: vi.fn(() => null),
      isLoadingDetail: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ pedidoId: '42' }) } } },
        { provide: OrdersStore, useValue: ordersStoreMock },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const context = createOrderDetailPageContext();

      context.loadOrderDetail();
      context.clearOrderDetail();

      expect(context.pedidoId()).toBe('42');
      expect(ordersStoreMock.loadOrderDetail).toHaveBeenCalledWith('42');
      expect(ordersStoreMock.clearCurrentOrder).toHaveBeenCalledTimes(1);
    });
  });
});
