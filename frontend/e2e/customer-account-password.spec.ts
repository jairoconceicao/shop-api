import { expect, test } from '@playwright/test';

import {
  customerAccountPasswordProfile,
  customerAccountPasswordSession,
  customerAccountPasswordUpdateResponse,
} from './customer-account-password.context';

test('allows a customer to access the account area and change the password', async ({ page }) => {
  await page.addInitScript((authSession) => {
    localStorage.setItem('shop-api.auth.session', JSON.stringify(authSession));
  }, customerAccountPasswordSession);

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
        data: customerAccountPasswordProfile,
      }),
    });
  });

  await page.route('**/api/v1/cliente/20/senha', async (route) => {
    if (route.request().method() !== 'PUT') {
      await route.fallback();
      return;
    }

    const requestBody = route.request().postDataJSON() as {
      senhaAtual?: string;
      senhaNova?: string;
    };

    expect(requestBody).toEqual({
      senhaAtual: '12345678',
      senhaNova: '87654321',
    });

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Senha atualizada com sucesso.',
        data: customerAccountPasswordUpdateResponse,
      }),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/account');

  await expect(page).toHaveURL('/account');
  await expect(page.getByRole('heading', { name: 'Minha conta' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Alterar senha' })).toBeVisible();

  await page.getByRole('link', { name: 'Alterar senha' }).click();

  await expect(page).toHaveURL('/account/password');
  await expect(page.getByRole('heading', { name: 'Alterar senha' })).toBeVisible();
  await expect(page.getByLabel('Senha atual')).toBeVisible();
  await expect(page.getByLabel('Nova senha')).toBeVisible();
  await expect(page.getByLabel('Confirmacao da senha')).toBeVisible();

  await page.getByLabel('Senha atual').fill('12345678');
  await page.getByLabel('Nova senha').fill('87654321');
  await page.getByLabel('Confirmacao da senha').fill('87654321');
  await page.getByRole('button', { name: 'Salvar senha' }).click();

  await expect(page.getByRole('heading', { name: 'Sua senha foi alterada' })).toBeVisible();
  await expect(page.getByText('Sua senha foi atualizada com sucesso. Use a nova senha no próximo acesso.')).toBeVisible();
});
