import { expect, test } from './fixtures'

test('atualiza dados e troca a senha com confirmação e limpeza sensível', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  const updatedCpf = `8000000${data.cpf.slice(-4)}`
  const updatedName = `${data.name} Atualizado`
  const updatedEmail = `atualizado-${data.email}`
  const updatedStreet = `${data.street} Atualizada`
  const firstNewPassword = `Primeira@${data.cpf.slice(-4)}A`
  const finalNewPassword = `Final@${data.cpf.slice(-4)}B`

  authApi.seedCustomer()
  authApi.expectRequestCounts({
    login: 1,
    categories: 3,
    profile: 3,
    profileUpdate: 1,
    passwordUpdate: 2,
  })

  await page.goto('/minha-conta/dados')
  await expect(page).toHaveURL('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page).toHaveURL('/minha-conta/dados')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus dados' }),
  ).toBeVisible()
  await expect(page.getByLabel('Nome completo')).toHaveValue(data.name)
  await expect(page.getByLabel('CPF')).toHaveValue(
    data.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )

  await page.getByLabel('Nome completo').fill(updatedName)
  await page.getByLabel('CPF').fill(updatedCpf)
  await page.getByLabel('E-mail').fill(updatedEmail)
  await page.getByLabel('Logradouro').fill(updatedStreet)
  await page.getByRole('button', { name: 'Salvar alterações' }).click()

  const cpfDialog = page.getByRole('dialog', {
    name: 'Confirmar alteração do CPF',
  })
  await expect(cpfDialog).toBeVisible()
  await expect(cpfDialog).toContainText('CPF atual')
  await expect(cpfDialog).toContainText('Novo CPF')
  await expect(cpfDialog).toContainText(
    data.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )
  await expect(cpfDialog).toContainText(
    updatedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )
  expect(authApi.requestCounts().profileUpdate).toBe(0)
  await cpfDialog.getByRole('button', { name: 'Confirmar alteração' }).click()

  await expect(
    page.getByRole('status').filter({
      hasText: 'Dados atualizados com sucesso.',
    }),
  ).toBeVisible()
  await expect(page.getByLabel('Nome completo')).toHaveValue(updatedName)
  await expect(page.getByLabel('CPF')).toHaveValue(
    updatedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )
  await expect(page.getByLabel('E-mail')).toHaveValue(updatedEmail)
  await expect(page.getByLabel('Logradouro')).toHaveValue(updatedStreet)
  await expect.poll(() => authApi.customerSnapshot()).toMatchObject({
    cpf: updatedCpf,
    nome: updatedName,
    email: updatedEmail,
    endereco: { logradouro: updatedStreet },
  })

  await page.reload()
  await expect(page).toHaveURL('/minha-conta/dados')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus dados' }),
  ).toBeVisible()
  await expect(page.getByLabel('Nome completo')).toHaveValue(updatedName)
  await expect(page.getByLabel('CPF')).toHaveValue(
    updatedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )
  await expect(page.getByLabel('E-mail')).toHaveValue(updatedEmail)
  await expect(page.getByLabel('Logradouro')).toHaveValue(updatedStreet)

  await page.getByRole('link', { name: 'Trocar senha' }).click()
  await expect(page).toHaveURL('/minha-conta/senha')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Alterar senha' }),
  ).toBeVisible()
  const rules = page.getByRole('list', { name: 'Regras da nova senha' })
  await expect(rules).toContainText('Mínimo de oito caracteres')
  await expect(rules).toContainText('Uma letra maiúscula')
  await expect(rules).toContainText('Um número')
  await expect(rules).toContainText('Um caractere especial entre !@#$%')

  await page.getByLabel('Senha atual').fill(data.password)
  const newPasswordInput = page.getByRole('textbox', { name: 'Nova senha' })
  await newPasswordInput.fill('curta')
  await page.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'A nova senha deve atender a todas as regras.',
  )
  expect(authApi.requestCounts().passwordUpdate).toBe(0)

  await newPasswordInput.fill(firstNewPassword)
  const satisfiedRules = rules.getByRole('listitem')
  await expect(satisfiedRules).toHaveCount(4)
  await expect(satisfiedRules).toHaveText([
    /Mínimo de oito caracteres\s*Atendida/,
    /Uma letra maiúscula\s*Atendida/,
    /Um número\s*Atendida/,
    /Um caractere especial entre !@#\$%\s*Atendida/,
  ])
  await page.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(page.getByRole('alert')).toContainText('Senha atual incorreta.')
  await expect(page.getByLabel('Senha atual')).toHaveValue(data.password)
  await expect(newPasswordInput).toHaveValue('')

  await newPasswordInput.fill(finalNewPassword)
  await page.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(
    page.getByRole('status').filter({
      hasText: 'Senha alterada com sucesso.',
    }),
  ).toBeVisible()
  await expect(page.getByLabel('Senha atual')).toHaveValue('')
  await expect(newPasswordInput).toHaveValue('')

  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    login: 1,
    categories: 3,
    profile: 3,
    profileUpdate: 1,
    passwordUpdate: 2,
  })
  expect(authApi.requestCounts().passwordUpdate).toBe(2)
})
