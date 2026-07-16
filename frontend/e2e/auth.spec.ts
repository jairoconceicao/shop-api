import { expect, test } from './fixtures'

test('cadastra, autentica, preserva a sessão local e encerra o acesso protegido', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  authApi.expectRequestCounts({
    register: 1,
    login: 1,
    categories: 4,
    profile: 2,
    logout: 1,
  })

  await page.goto('/cadastro')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Cadastro de cliente' }),
  ).toBeVisible()

  await page.getByLabel('Nome completo').fill(data.name)
  await page.getByLabel('CPF').fill(data.cpf)
  await page.getByLabel('Data de nascimento').fill(data.birthDate)
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByLabel('CEP').fill(data.postalCode)
  await page.getByLabel('Logradouro').fill(data.street)
  await page.getByLabel('Número').fill(data.number)
  await page.getByLabel('Bairro').fill(data.district)
  await page.getByLabel('Cidade').fill(data.city)
  await page.getByLabel('UF').fill(data.state)
  await page
    .getByRole('textbox', { name: 'Celular', exact: true })
    .fill(`${data.areaCode}${data.phone}`)
  await page
    .getByRole('checkbox', {
      name: 'Este celular também é WhatsApp',
    })
    .check()
  await page.getByRole('button', { name: 'Criar conta' }).click()

  await expect(page).toHaveURL('/entrar')
  await expect(page.getByRole('status')).toContainText('Cadastro concluído')
  await expect(page.getByRole('status')).toContainText(
    'Sua conta foi criada. Entre com as credenciais cadastradas.',
  )

  await expect
    .poll(async () =>
      page.evaluate(() => ({
        local: localStorage.getItem('shop-api:auth'),
        session: sessionStorage.getItem('shop-api:auth'),
      })),
    )
    .toEqual({ local: null, session: null })

  await page.goto('/minha-conta/dados')

  await expect(page).toHaveURL('/entrar')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Entrar na sua conta' }),
  ).toBeVisible()

  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('checkbox', { name: 'Manter conectado' }).check()
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page).toHaveURL('/minha-conta/dados')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus dados' }),
  ).toBeVisible()
  await expect(page.getByLabel('Nome completo')).toHaveValue(data.name)
  await page.waitForLoadState('networkidle')

  await expect
    .poll(async () =>
      page.evaluate(() => ({
        local: localStorage.getItem('shop-api:auth'),
        session: sessionStorage.getItem('shop-api:auth'),
      })),
    )
    .toEqual({
      local: expect.stringContaining(data.email),
      session: null,
    })

  await page.reload()

  await expect(page).toHaveURL('/minha-conta/dados')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus dados' }),
  ).toBeVisible()
  await expect(page.getByLabel('E-mail')).toHaveValue(data.email)
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: 'Área do cliente' }).click()
  await page.getByRole('menuitem', { name: 'Sair' }).click()

  await expect(page).toHaveURL('/entrar')
  await expect
    .poll(async () =>
      page.evaluate(() => ({
        local: localStorage.getItem('shop-api:auth'),
        session: sessionStorage.getItem('shop-api:auth'),
      })),
    )
    .toEqual({ local: null, session: null })

  await page.goto('/minha-conta/dados')

  await expect(page).toHaveURL('/entrar')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Entrar na sua conta' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus dados' }),
  ).toHaveCount(0)
})
