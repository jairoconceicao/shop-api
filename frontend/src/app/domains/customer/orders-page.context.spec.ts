import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { OrdersStore } from '../checkout/orders.store';
import { CustomerStore } from './customer.store';
import { createOrdersPageContext } from './orders-page.context';

describe('createOrdersPageContext', () => {
  it('loads the customer profile when the profile is missing', () => {
    const customerStoreMock = {
      loadProfile: vi.fn(),
      hasProfile: vi.fn(() => false),
      isLoading: vi.fn(() => false),
      cpf: vi.fn(() => ''),
    };
    const ordersStoreMock = {
      loadOrders: vi.fn(),
      orders: vi.fn(() => []),
      totalItems: vi.fn(() => 0),
      totalPages: vi.fn(() => 0),
      currentPage: vi.fn(() => 1),
      pageSize: vi.fn(() => 20),
      isLoading: vi.fn(() => false),
      hasOrders: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CustomerStore, useValue: customerStoreMock },
        { provide: OrdersStore, useValue: ordersStoreMock },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const context = createOrdersPageContext();

      context.ensureCustomerProfileLoaded();

      expect(customerStoreMock.loadProfile).toHaveBeenCalledTimes(1);
      expect(context.hasCustomerProfile()).toBe(false);
      expect(context.customerCpf()).toBe('');
      expect(ordersStoreMock.loadOrders).not.toHaveBeenCalled();
    });
  });

  it('does not reload the customer profile when it is already available', () => {
    const customerStoreMock = {
      loadProfile: vi.fn(),
      hasProfile: vi.fn(() => true),
      isLoading: vi.fn(() => false),
      cpf: vi.fn(() => '12345678901'),
    };
    const ordersStoreMock = {
      loadOrders: vi.fn(),
      orders: vi.fn(() => []),
      totalItems: vi.fn(() => 0),
      totalPages: vi.fn(() => 0),
      currentPage: vi.fn(() => 1),
      pageSize: vi.fn(() => 20),
      isLoading: vi.fn(() => false),
      hasOrders: vi.fn(() => false),
      error: vi.fn(() => null),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CustomerStore, useValue: customerStoreMock },
        { provide: OrdersStore, useValue: ordersStoreMock },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const context = createOrdersPageContext();

      context.ensureCustomerProfileLoaded();

      expect(customerStoreMock.loadProfile).not.toHaveBeenCalled();
      expect(context.hasCustomerProfile()).toBe(true);
      expect(context.customerCpf()).toBe('12345678901');
      expect(ordersStoreMock.loadOrders).toHaveBeenCalledWith({
        cpf: '12345678901',
        page: 1,
        size: 20,
      });
    });
  });
});
