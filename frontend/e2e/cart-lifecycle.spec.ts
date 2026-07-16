import { expect, test } from './fixtures'

test('adiciona, altera a quantidade e remove o item do carrinho', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  const productPath = `/produtos/${data.product.id}`

  authApi.seedCustomer()
  authApi.expectRequestCounts({
    login: 1,
    categories: 3,
    product: 2,
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 4,
    cartUpdate: 1,
    cartDelete: 1,
  })

  await page.goto('/carrinho')
  await expect(page).toHaveURL('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page).toHaveURL('/carrinho')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Carrinho' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Seu carrinho está vazio' }),
  ).toBeVisible()
  await expect(page.getByLabel('Carrinho', { exact: true })).toBeVisible()

  await page.goto(productPath)
  await expect(
    page.getByRole('heading', { level: 1, name: data.product.title }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(
    page.getByRole('spinbutton', { name: 'Quantidade' }),
  ).toHaveValue('3')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()

  await expect(
    page.getByRole('status').filter({
      hasText: 'Produto adicionado ao carrinho',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Carrinho com 3 itens' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Carrinho com 3 itens' }).click()

  await expect(page).toHaveURL('/carrinho')
  await expect(
    page.getByRole('link', { name: data.product.title }),
  ).toBeVisible()
  await expect(
    page.getByRole('spinbutton', {
      name: `Quantidade de ${data.product.title}`,
    }),
  ).toHaveValue('3')
  await expect(page.getByText(/R\$\s10\.499,70/, { exact: true })).toHaveCount(
    3,
  )

  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Quantidade atualizada' }),
  ).toBeVisible()
  await expect(
    page.getByRole('spinbutton', {
      name: `Quantidade de ${data.product.title}`,
    }),
  ).toHaveValue('4')
  await expect(
    page.getByRole('link', { name: 'Carrinho com 4 itens' }),
  ).toBeVisible()
  await expect(page.getByText(/R\$\s13\.999,60/, { exact: true })).toHaveCount(
    3,
  )

  await page
    .getByRole('button', { name: `Remover ${data.product.title}` })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Remover item do carrinho?',
  })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(
    `Você deseja remover ${data.product.title}?`,
  )
  await dialog.getByRole('button', { name: 'Remover item' }).click()

  await expect(
    page.getByRole('heading', { name: 'Seu carrinho está vazio' }),
  ).toBeVisible()
  await expect(page.getByLabel('Carrinho', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Carrinho com \d+ itens?/ }),
  ).toHaveCount(0)
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 4,
    cartUpdate: 1,
    cartDelete: 1,
  })
})
