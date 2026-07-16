import { expect, test } from './fixtures'

test('loads the SPA', async ({ authApi, page }) => {
  authApi.expectRequestCounts({})

  await page.goto('/entrar')

  await expect(page).toHaveTitle('shop-api')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Entrar na sua conta' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Criar agora' })).toHaveAttribute(
    'href',
    '/cadastro',
  )
})
