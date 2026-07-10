import { expect, test } from '@playwright/test';

test('shows product details and redirects anonymous users to login when buying', async ({
  page,
}) => {
  await page.route('**/api/v1/produto/101', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Produto carregado com sucesso.',
        data: {
          produtoId: 101,
          titulo: 'Notebook Gamer',
          descricao: 'Notebook para jogos',
          modelo: 'RTX',
          foto: 'https://cdn.shopapi.dev/notebook.jpg',
          preco: 5999.9,
          estoque: 12,
          categoria: {
            categoriaId: 1,
            titulo: 'Informática',
          },
        },
      }),
    });
  });

  await page.goto('/products/101');

  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByText('12 em estoque')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Comprar agora' })).toBeVisible();

  await page.getByRole('button', { name: 'Comprar agora' }).click();

  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fproducts%2F101/);
});

test('shows the unavailable state for products without stock', async ({ page }) => {
  await page.route('**/api/v1/produto/102', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Produto carregado com sucesso.',
        data: {
          produtoId: 102,
          titulo: 'Notebook Gamer Pro',
          descricao: 'Notebook para jogos de alta performance',
          modelo: 'RTX 4090',
          foto: null,
          preco: 8999.9,
          estoque: 0,
          categoria: {
            categoriaId: 1,
            titulo: 'Informática',
          },
        },
      }),
    });
  });

  await page.goto('/products/102');

  await expect(page.getByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();
  await expect(page.getByText('Produto sem estoque.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Avise-me quando chegar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Comprar agora' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toHaveCount(0);
});
