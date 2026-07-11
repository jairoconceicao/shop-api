import { expect, test } from '@playwright/test';

test('shows the storefront foundation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Sua vitrine mobile first/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explorar vitrine' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Produtos em destaque' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notebook Gamer' })).toBeVisible();
});
