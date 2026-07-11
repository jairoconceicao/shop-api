import { expect, test } from '@playwright/test';

import {
  catalogSearchCategoryCategories,
  catalogSearchCategoryCategoryProduct,
  catalogSearchCategoryInitialProduct,
  catalogSearchCategorySearchProduct,
} from './catalog-search-category.context';

test('keeps search and category filters in sync with the public catalog', async ({ page }) => {
  await page.route('**/api/v1/categoria**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Categorias carregadas com sucesso.',
        data: catalogSearchCategoryCategories,
      }),
    });
  });

  await page.route('**/api/v1/produto**', async (route) => {
    const url = new URL(route.request().url());
    const searchword = url.searchParams.get('searchword');

    if (url.pathname.includes('/categoria/2')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          message: 'Catalogo de produtos carregado com sucesso.',
          pagination: {
            pages: 1,
            size: 8,
            totalItems: 1,
            data: [catalogSearchCategoryCategoryProduct],
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Catalogo de produtos carregado com sucesso.',
        pagination: {
          pages: 1,
          size: 8,
          totalItems: 1,
          data: searchword === 'notebook gamer' ? [catalogSearchCategorySearchProduct] : [catalogSearchCategoryInitialProduct],
        },
      }),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/products');

  await expect(page.getByRole('heading', { name: /Explore produtos/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();

  await page.locator('article form input[type="search"]').fill('notebook gamer');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Notebook Gamer Pro' })).toBeVisible();
  await expect(page).toHaveURL(/searchword=notebook%20gamer/);

  await page.getByRole('button', { name: 'Celulares' }).click();

  await expect(page.getByRole('heading', { name: 'Smartphone Gamer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Celulares' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('article form input[type="search"]')).toHaveValue('notebook gamer');
  await expect(page).toHaveURL(/searchword=notebook%20gamer/);
  await expect(page).toHaveURL(/categoriaId=2/);
});
