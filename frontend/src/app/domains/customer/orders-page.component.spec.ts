import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { CustomerStore } from './customer.store';
import { OrdersPageComponent } from './orders-page.component';

describe('OrdersPageComponent', () => {
  it('renders the customer orders route shell', async () => {
    const customerStoreMock = {
      loadProfile: vi.fn(),
      hasProfile: vi.fn(() => false),
      isLoading: vi.fn(() => false),
      cpf: vi.fn(() => ''),
    };

    await render(OrdersPageComponent, {
      providers: [provideRouter([]), { provide: CustomerStore, useValue: customerStoreMock }],
    });

    expect(customerStoreMock.loadProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Meus pedidos' })).toBeVisible();
    expect(screen.getByText('Voltar para conta')).toHaveAttribute('href', '/account');
    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByText('Nenhum pedido carregado ainda')).toBeVisible();
  });
});
