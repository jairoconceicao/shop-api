import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { OrderStatusBadgeComponent } from './order-status-badge.component';

describe('OrderStatusBadgeComponent', () => {
  it('renders a friendly label and semantic variant for processed orders', async () => {
    await render(OrderStatusBadgeComponent, {
      componentInputs: {
        status: 'Processado',
      },
    });

    const badge = screen.getByLabelText('Status do pedido');

    expect(badge).toHaveTextContent('Processado');
    expect(badge).toHaveClass('bg-shop-success-soft');
    expect(badge).toHaveClass('text-shop-success');
  });

  it('renders a danger variant for canceled orders', async () => {
    await render(OrderStatusBadgeComponent, {
      componentInputs: {
        status: 'Cancelado',
      },
    });

    const badge = screen.getByLabelText('Status do pedido');

    expect(badge).toHaveTextContent('Cancelado');
    expect(badge).toHaveClass('bg-shop-danger-soft');
    expect(badge).toHaveClass('text-shop-danger');
  });
});
