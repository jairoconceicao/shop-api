import { expect, test } from '@playwright/test';

import {
  productDetailsAddToCartProduct,
  productDetailsAddToCartSession,
} from './product-details-add-to-cart.context';

test('shows product details and adds the product to the cart', async ({ page }) => {
  await page.addInitScript((authSession) => {
    localStorage.setItem('shop-api.auth.session', JSON.stringify(authSession));
  }, productDetailsAddToCartSession);

  await page.route('**/api/v1/produto/101', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Produto carregado com sucesso.',
        data: productDetailsAddToCartProduct,
      }),
    });
  });

  await page.route('**/api/v1/carrinho/items', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Item adicionado ao carrinho.',
        data: {
          itemId: 55,
        },
      }),
    });
  });

  await page.goto('/products/101');

  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Notebook Gamer' })).toBeVisible();
  await expect(page.getByText('12 em estoque').first()).toBeVisible();

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

  await page.getByRole('link', { name: 'Carrinho' }).click();

  await expect(page.getByRole('heading', { name: 'Produtos no carrinho' })).toBeVisible();
  await expect(page.getByText('Produto #101')).toBeVisible();
  await expect(page.getByText('Item #55')).toBeVisible();
  await expect(page.getByText('R$ 5.999,90').first()).toBeVisible();
});
