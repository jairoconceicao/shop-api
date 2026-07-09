import { expect, test } from '@playwright/test';

test('shows the storefront foundation', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Shop API').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Sua nova vitrine/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver catalogo' })).toBeVisible();
});
