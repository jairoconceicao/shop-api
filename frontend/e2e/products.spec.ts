import { expect, test } from '@playwright/test';

test('shows the public products catalog', async ({ page }) => {
  await page.route('**/api/v1/produto**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Catalogo de produtos carregado com sucesso.',
        pagination: {
          pages: 1,
          size: 8,
          totalItems: 1,
          data: [
            {
              produtoId: 101,
              titulo: 'Notebook Gamer',
              thumb: null,
              preco: 5999.9,
              estoque: 12,
              categoria: {
                categoriaId: 1,
                titulo: 'Informática',
              },
            },
          ],
        },
      }),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/products');

  await expect(page.getByRole('heading', { name: /Explore produtos/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver produto' })).toBeVisible();
});
