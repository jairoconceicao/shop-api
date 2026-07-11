import { expect, test } from '@playwright/test';

import { authProtectedRouteLoginSession } from './auth-protected-route.context';

test('redirects anonymous users to login and grants access after authentication', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        status: true,
        message: 'Login realizado com sucesso.',
        data: authProtectedRouteLoginSession,
      }),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/account');

  await expect(page).toHaveURL(/\/login\?returnUrl=%2Faccount/);
  await expect(page.getByRole('heading', { name: /Acesse sua conta/i })).toBeVisible();

  await page.getByLabel('E-mail').fill(authProtectedRouteLoginSession.email);
  await page.getByLabel('Senha').fill('12345678');
  await page.getByRole('checkbox', { name: 'Manter-me conectado' }).check();
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.waitForFunction(() => Boolean(window.localStorage.getItem('shop-api.auth.session')));
  const storedSession = await page.evaluate(() => window.localStorage.getItem('shop-api.auth.session'));
  expect(storedSession).toContain(authProtectedRouteLoginSession.email);

  await page.goto('/account');

  await expect(page).toHaveURL('/account');
  await expect(page.getByRole('heading', { name: /Minha conta/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Meus dados' })).toBeVisible();
});
