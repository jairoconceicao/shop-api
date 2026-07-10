import { expect, test } from '@playwright/test';

test('shows the public products catalog', async ({ page }) => {
  await page.route('**/api/v1/produto**', async (route) => {
    const url = new URL(route.request().url());
    const searchword = url.searchParams.get('searchword');

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(
        searchword === 'notebook gamer'
          ? {
              status: true,
              message: 'Catalogo de produtos carregado com sucesso.',
              pagination: {
                pages: 1,
                size: 8,
                totalItems: 1,
                data: [
                  {
                    produtoId: 102,
                    titulo: 'Notebook Gamer Pro',
                    thumb: null,
                    preco: 7999.9,
                    estoque: 4,
                    categoria: {
                      categoriaId: 1,
                      titulo: 'Informática',
                    },
                  },
                ],
              },
            }
          : {
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
            },
      ),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/products');

  await expect(page.getByRole('heading', { name: /Explore produtos/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver produto' })).toBeVisible();

  await page.getByLabel('Buscar produtos').fill('notebook gamer');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();
});
