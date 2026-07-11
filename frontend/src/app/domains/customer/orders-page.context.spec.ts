import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

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

    TestBed.configureTestingModule({
      providers: [{ provide: CustomerStore, useValue: customerStoreMock }],
    });

    TestBed.runInInjectionContext(() => {
      const context = createOrdersPageContext();

      context.ensureCustomerProfileLoaded();

      expect(customerStoreMock.loadProfile).toHaveBeenCalledTimes(1);
      expect(context.hasCustomerProfile()).toBe(false);
      expect(context.customerCpf()).toBe('');
    });
  });

  it('does not reload the customer profile when it is already available', () => {
    const customerStoreMock = {
      loadProfile: vi.fn(),
      hasProfile: vi.fn(() => true),
      isLoading: vi.fn(() => false),
      cpf: vi.fn(() => '12345678901'),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: CustomerStore, useValue: customerStoreMock }],
    });

    TestBed.runInInjectionContext(() => {
      const context = createOrdersPageContext();

      context.ensureCustomerProfileLoaded();

      expect(customerStoreMock.loadProfile).not.toHaveBeenCalled();
      expect(context.hasCustomerProfile()).toBe(true);
      expect(context.customerCpf()).toBe('12345678901');
    });
  });
});
