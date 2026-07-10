import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  it('renders the product image, title, price, stock and CTA', async () => {
    await render(
      `
        <app-product-card [product]="product" ctaLabel="Ver produto" ctaLink="/products/101" />
      `,
      {
        imports: [ProductCardComponent],
        componentProperties: {
          product: {
            produtoId: 101,
            titulo: 'Notebook Gamer',
            thumb: 'https://cdn.shopapi.dev/notebook.jpg',
            preco: 5999.9,
            estoque: 12,
            categoria: {
              categoriaId: 1,
              titulo: 'Informática',
            },
          },
        },
      },
    );

    expect(screen.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Notebook Gamer' })).toBeVisible();
    expect(screen.getByText('R$ 5.999,90')).toBeVisible();
    expect(screen.getByText('12 em estoque')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver produto' })).toHaveAttribute(
      'href',
      '/products/101',
    );
  });

  it('falls back to the default visual treatment when the product has no image', async () => {
    await render(
      `
        <app-product-card [product]="product" />
      `,
      {
        imports: [ProductCardComponent],
        componentProperties: {
          product: {
            produtoId: 102,
            titulo: 'Mouse Sem Fio',
            thumb: null,
            preco: '129.9',
            estoque: '0',
            categoria: null,
          },
        },
      },
    );

    expect(screen.getByRole('heading', { name: 'Mouse Sem Fio' })).toBeVisible();
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('R$ 129,90')).toBeVisible();
    expect(screen.getByText('0 em estoque')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Comprar' })).toHaveAttribute('href', '/products/102');
  });
});
