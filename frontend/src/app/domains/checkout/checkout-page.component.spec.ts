import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { CheckoutPageComponent } from './checkout-page.component';

describe('CheckoutPageComponent', () => {
  it('renders the protected checkout landing state', async () => {
    await render(CheckoutPageComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: 'Finalize sua compra com segurança.' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Checkout pronto para evolucao.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar ao carrinho' })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: 'Continuar comprando' })).toHaveAttribute(
      'href',
      '/products',
    );
  });
});
