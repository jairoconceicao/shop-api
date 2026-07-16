import { expect, test } from './fixtures'

test('cadastra, autentica, preserva a sessão local e encerra o acesso protegido', async ({
  authApi,
  page,
}) => {
  authApi.expectRequestCounts({
    register: 1,
    login: 1,
    categories: 2,
    profile: 2,
    logout: 1,
  })

  await page.goto('/cadastro')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Cadastro de cliente' }),
  ).toBeVisible()
})
