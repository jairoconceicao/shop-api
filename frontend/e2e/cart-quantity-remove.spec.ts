import { expect, test } from '@playwright/test';

import {
  cartQuantityRemoveProduct,
  cartQuantityRemoveSession,
} from './cart-quantity-remove.context';

test('updates the cart item quantity and removes the item', async ({ page }) => {
  await page.addInitScript((authSession) => {
    localStorage.setItem('shop-api.auth.session', JSON.stringify(authSession));
  }, cartQuantityRemoveSession);

  await page.route('**/api/v1/produto/101', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Produto carregado com sucesso.',
        data: cartQuantityRemoveProduct,
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

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('link', { name: 'Carrinho' }).click();

  await expect(page.getByRole('heading', { name: 'Produtos no carrinho' })).toBeVisible();
  await expect(page.getByText('Produto #101')).toBeVisible();
  await expect(page.getByText('Item #55')).toBeVisible();
  await expect(page.getByText('1 item(ns)')).toBeVisible();
  await expect(page.getByText('R$ 5.999,90').first()).toBeVisible();

  await page.getByRole('button', { name: 'Aumentar quantidade' }).click();

  await expect(page.getByText('2 item(ns)')).toBeVisible();
  await expect(page.getByText('R$ 11.999,80').first()).toBeVisible();

  await page.getByRole('button', { name: 'Remover' }).click();

  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver produtos' })).toBeVisible();
});

