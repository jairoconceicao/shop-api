import { expect, test } from '@playwright/test'

test('loads the SPA', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('shop-api')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Encontre produtos para o seu dia a dia',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Catálogo' }),
  ).toBeVisible()
})
