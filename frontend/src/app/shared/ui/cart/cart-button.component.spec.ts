import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { CartButtonComponent } from './cart-button.component';

describe('CartButtonComponent', () => {
  it('renders the cart link with badge count when items exist', async () => {
    await render(CartButtonComponent, {
      componentInputs: { count: 3 },
    });

    expect(screen.getByRole('link', { name: 'Ir para o carrinho' })).toHaveAttribute(
      'href',
      '/cart',
    );
    expect(screen.getByText('3')).toBeVisible();
  });

  it('hides the badge when the cart is empty', async () => {
    await render(CartButtonComponent);

    expect(screen.queryByText('0')).toBeNull();
  });
});
