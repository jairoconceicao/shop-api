import { expect, test } from '@playwright/test'

test('loads the SPA', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('shop-api')
  await expect(
    page.getByRole('heading', { level: 1, name: 'shop-api' }),
  ).toBeVisible()
})
