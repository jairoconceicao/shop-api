import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { OrdersPageComponent } from './orders-page.component';

describe('OrdersPageComponent', () => {
  it('renders the customer orders route shell', async () => {
    await render(OrdersPageComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: 'Meus pedidos' })).toBeVisible();
    expect(screen.getByText('Voltar para conta')).toHaveAttribute('href', '/account');
    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByText('Nenhum pedido carregado ainda')).toBeVisible();
  });
});
