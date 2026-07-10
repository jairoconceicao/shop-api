import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import type { CartItem } from '@shared/models';

import { CartStore } from '@domains/cart/cart.store';
import { CheckoutPageComponent } from './checkout-page.component';

describe('CheckoutPageComponent', () => {
  const item = (overrides: Partial<CartItem> = {}): CartItem => ({
    itemId: 1,
    produtoId: 10,
    quantidade: 2,
    valorUnitario: 199.9,
    ...overrides,
  });

  it('renders the active cart data in checkout', async () => {
    const cartStore = TestBed.inject(CartStore);
    cartStore.setItems([item(), item({ itemId: 2, produtoId: 20, quantidade: 1, valorUnitario: 50 })]);

    await render(CheckoutPageComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: 'Finalize sua compra com segurança.' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Itens prontos para o pedido' })).toBeVisible();
    expect(screen.getByText('Produto #10')).toBeVisible();
    expect(screen.getByText('Produto #20')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Continuar checkout' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Revisar carrinho' })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('link', { name: 'Continuar comprando' })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('shows an empty state when there is no active cart data', async () => {
    TestBed.inject(CartStore).clear();

    await render(CheckoutPageComponent, {
      providers: [provideRouter([])],
    });

    expect(
      screen.getByRole('heading', { name: 'Adicione produtos ao carrinho antes de continuar' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ir para o carrinho' })).toHaveAttribute('href', '/cart');
  });
});
