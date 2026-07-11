import { expect, test } from '@playwright/test';

import {
  publicCatalogCategory,
  publicCatalogHomeFeaturedProduct,
  publicCatalogSearchProduct,
} from './public-catalog.context';

test('allows anonymous access to the public catalog', async ({ page }) => {
  await page.route('**/api/v1/categoria**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Categorias carregadas com sucesso.',
        data: [publicCatalogCategory],
      }),
    });
  });

  await page.route('**/api/v1/produto**', async (route) => {
    const url = new URL(route.request().url());
    const searchword = url.searchParams.get('searchword');

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Catalogo de produtos carregado com sucesso.',
        pagination: {
          pages: 1,
          size: 8,
          totalItems: 1,
          data: searchword === 'notebook gamer' ? [publicCatalogSearchProduct] : [publicCatalogHomeFeaturedProduct],
        },
      }),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /Sua vitrine mobile first/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Produtos em destaque' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explorar vitrine' })).toBeVisible();

  await page.goto('/products');
  await expect(page).toHaveURL('/products');
  await expect(page.getByRole('heading', { name: /Explore produtos/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver produto' })).toBeVisible();

  await page.getByLabel('Buscar produtos').fill('notebook gamer');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();
  await expect(page).toHaveURL(/searchword=notebook%20gamer/);
  await expect(page).not.toHaveURL(/login/);
});
