import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { CartSummaryComponent } from './cart-summary.component';

describe('CartSummaryComponent', () => {
  it('renders totals and the checkout cta', async () => {
    await render(CartSummaryComponent, {
      componentInputs: {
        subtotal: 499.7,
        shipping: 0,
        ctaLabel: 'Finalizar compra',
      },
    });

    expect(screen.getByText('R$ 499,70')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Finalizar compra' })).toBeVisible();
  });

});
