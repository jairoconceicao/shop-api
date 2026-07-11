import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { OrdersStore } from '../checkout/orders.store';
import { CustomerStore } from './customer.store';
import { OrdersPageComponent } from './orders-page.component';

describe('OrdersPageComponent', () => {
  it('loads the customer orders list when the profile is available', async () => {
    const customerStoreMock = {
      loadProfile: vi.fn(),
      hasProfile: vi.fn(() => true),
      isLoading: vi.fn(() => false),
      cpf: vi.fn(() => '12345678901'),
    };
    const ordersStoreMock = {
      loadOrders: vi.fn(),
      orders: vi.fn(() => [
        {
          pedidoId: 999,
          status: 'Criado',
          dataPedido: '2026-07-11T12:00:00-03:00',
          formaPagamento: 'Pix',
        },
      ]),
      totalItems: vi.fn(() => 1),
      totalPages: vi.fn(() => 1),
      currentPage: vi.fn(() => 1),
      pageSize: vi.fn(() => 20),
      isLoading: vi.fn(() => false),
      hasOrders: vi.fn(() => true),
      error: vi.fn(() => null),
    };

    await render(OrdersPageComponent, {
      providers: [
        provideRouter([]),
        { provide: CustomerStore, useValue: customerStoreMock },
        { provide: OrdersStore, useValue: ordersStoreMock },
      ],
    });

    expect(customerStoreMock.loadProfile).not.toHaveBeenCalled();
    expect(ordersStoreMock.loadOrders).toHaveBeenCalledWith({
      cpf: '12345678901',
      page: 1,
      size: 20,
    });
    expect(screen.getByRole('heading', { name: 'Meus pedidos' })).toBeVisible();
    expect(screen.getByText('Voltar para conta')).toHaveAttribute('href', '/account');
    expect(screen.getByText('Pedido #999')).toBeVisible();
    expect(screen.getByText('Criado')).toBeVisible();
    expect(screen.getByText('1 pedido(s) encontrados')).toBeVisible();
  });
});
