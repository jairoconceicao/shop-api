import { expect, test } from '@playwright/test';
import {
  cartCheckoutFlowCustomer,
  cartCheckoutFlowOrder,
  cartCheckoutFlowProduct,
  cartCheckoutFlowSession,
} from './cart-checkout-flow.context';

test('adds a product to the cart and finalizes the order', async ({ page }) => {
  await page.addInitScript((authSession) => {
    localStorage.setItem('shop-api.auth.session', JSON.stringify(authSession));
  }, cartCheckoutFlowSession);

  await page.route('**/api/v1/produto/101', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Produto carregado com sucesso.',
        data: cartCheckoutFlowProduct,
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

  await page.route('**/api/v1/cliente/20', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Cliente carregado com sucesso.',
        data: cartCheckoutFlowCustomer,
      }),
    });
  });

  await page.route('**/api/v1/pedido', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Pedido criado com sucesso.',
        data: cartCheckoutFlowOrder,
      }),
    });
  });

  await page.goto('/products/101');

  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/v1/carrinho/items') && response.request().method() === 'POST',
    ),
    page.getByRole('button', { name: 'Adicionar ao carrinho' }).click(),
  ]);

  await page.getByRole('link', { name: 'Carrinho' }).click();

  await expect(page.getByRole('heading', { name: 'Produtos no carrinho' })).toBeVisible();
  await expect(page.getByText('Produto #101')).toBeVisible();
  await expect(page.getByText('Item #55')).toBeVisible();
  await expect(page.getByText('R$ 5.999,90').first()).toBeVisible();

  await page.getByRole('button', { name: 'Finalizar compra' }).click();

  await expect(page.getByRole('heading', { name: 'Finalize sua compra com segurança.' })).toBeVisible();
  await expect(page.getByText('Rua Central')).toBeVisible();
  const paymentMethod = page.getByRole('combobox', { name: 'Forma de pagamento' });
  await expect(paymentMethod).toHaveValue('Pix');

  await paymentMethod.selectOption('Boleto');
  await expect(paymentMethod).toHaveValue('Boleto');

  await page.getByRole('button', { name: 'Finalizar pedido' }).click();

  await expect(page.getByRole('heading', { name: 'Seu pedido foi criado com sucesso' })).toBeVisible();
  await expect(page.getByText('Pedido confirmado')).toBeVisible();
  await expect(page.getByText(/O pedido #9999 foi confirmado/i)).toBeVisible();
  await expect(page.getByText('Boleto', { exact: true })).toBeVisible();
});
