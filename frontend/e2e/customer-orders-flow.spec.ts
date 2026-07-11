import { expect, test } from '@playwright/test';

import {
  customerOrdersFlowCanceled,
  customerOrdersFlowDetail,
  customerOrdersFlowList,
  customerOrdersFlowProfile,
  customerOrdersFlowSession,
} from './customer-orders-flow.context';

test('lists customer orders, opens detail and cancels an order', async ({ page }) => {
  await page.addInitScript((authSession) => {
    localStorage.setItem('shop-api.auth.session', JSON.stringify(authSession));
  }, customerOrdersFlowSession);

  await page.route('**/api/v1/cliente/20', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Cliente carregado com sucesso.',
        data: customerOrdersFlowProfile,
      }),
    });
  });

  await page.route('**/api/v1/pedido**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'GET' && url.pathname === '/api/v1/pedido') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          message: 'Pedidos carregados com sucesso.',
          pagination: customerOrdersFlowList,
        }),
      });
      return;
    }

    if (request.method() === 'GET' && url.pathname === '/api/v1/pedido/500') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          message: 'Pedido carregado com sucesso.',
          data: customerOrdersFlowDetail,
        }),
      });
      return;
    }

    if (request.method() === 'PATCH' && url.pathname === '/api/v1/pedido/500') {
      expect(route.request().postDataJSON()).toEqual({
        status: 'Cancelado',
      });

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          status: true,
          message: 'Pedido cancelado com sucesso.',
          data: customerOrdersFlowCanceled,
        }),
      });
      return;
    }

    await route.fallback();
  });

  await page.goto('/account/orders');

  await expect(page.getByRole('heading', { name: 'Acompanhe seus pedidos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pedido #500' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver detalhes' })).toBeVisible();

  await page.getByRole('link', { name: 'Ver detalhes' }).click();

  await expect(page).toHaveURL('/account/orders/500');
  await expect(page.getByRole('heading', { name: 'Detalhe do pedido #500' })).toBeVisible();
  await expect(page.getByText('Pix')).toBeVisible();
  await expect(page.getByText('Produto #101')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar pedido' })).toBeVisible();

  await page.getByRole('button', { name: 'Cancelar pedido' }).click();
  await page.getByRole('button', { name: 'Sim, cancelar pedido' }).click();

  await expect(page.getByLabel('Status do pedido')).toContainText('Cancelado');
  await expect(page.getByRole('button', { name: 'Cancelar pedido' })).toHaveCount(0);
});
