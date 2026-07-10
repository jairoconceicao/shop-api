import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { CartStore } from './cart.store';
import { CartPageComponent } from './cart-page.component';

describe('CartPageComponent', () => {
  it('renders the empty cart state when there are no items', async () => {
    await render(CartPageComponent, {
      providers: [provideRouter([]), CartStore],
    });

    expect(screen.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver produtos' })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('button', { name: 'Finalizar compra' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Produtos no carrinho' })).toBeNull();
  });

  it('renders the cart items and summary when the store has items', async () => {
    await render(CartPageComponent, {
      providers: [provideRouter([]), CartStore],
    });

    TestBed.inject(CartStore).setItems([
      {
        itemId: 1,
        produtoId: 101,
        quantidade: 2,
        valorUnitario: 199.9,
      },
      {
        itemId: 2,
        produtoId: 202,
        quantidade: 1,
        valorUnitario: 499.9,
      },
    ]);

    expect(screen.getByRole('heading', { name: 'Produtos no carrinho' })).toBeVisible();
    expect(screen.getByText('Produto #101')).toBeVisible();
    expect(screen.getByText('Produto #202')).toBeVisible();
    expect(screen.getByText('2 item(ns)')).toBeVisible();
    expect(screen.getByText('R$ 199,90')).toBeVisible();
    expect(screen.getByText('R$ 399,80')).toBeVisible();
    expect(screen.getByText('R$ 499,90')).toBeVisible();
    expect(screen.getByText('R$ 899,70')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Continuar comprando' })).toHaveAttribute(
      'href',
      '/products',
    );
  });
});
