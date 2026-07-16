import { expect, test } from './fixtures'

test('cria e confirma um pedido consumindo o carrinho', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  const editedStreet = `${data.street} — somente pedido`

  authApi.seedCustomer()
  const profileBeforeCheckout = authApi.customerSnapshot()
  expect(profileBeforeCheckout?.endereco.logradouro).toBe(data.street)
  authApi.expectRequestCounts({
    login: 1,
    categories: 3,
    product: 2,
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 2,
    profile: 1,
    orderCreate: 1,
  })

  await page.goto('/carrinho')
  await expect(page).toHaveURL('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL('/carrinho')

  await page.goto(`/produtos/${data.product.id}`)
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
  await page.getByRole('link', { name: 'Carrinho com 3 itens' }).click()

  await expect(page).toHaveURL('/carrinho')
  await expect(
    page.getByRole('spinbutton', {
      name: `Quantidade de ${data.product.title}`,
    }),
  ).toHaveValue('3')
  await page.getByRole('link', { name: 'Ir para checkout' }).click()

  await expect(page).toHaveURL('/checkout')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Checkout' }),
  ).toBeVisible()
  await expect(page.getByLabel('Logradouro')).toHaveValue(data.street)
  await expect(
    page.getByText('As alterações valem somente para este pedido.'),
  ).toBeVisible()
  await page.getByLabel('Logradouro').fill(editedStreet)
  await page.getByRole('radio', { name: 'Cartão' }).check()
  await expect(page.getByRole('radio', { name: 'Cartão' })).toBeChecked()
  await expect(
    page.getByText(/R\$\s10\.499,70/, { exact: true }),
  ).toHaveCount(2)

  const confirm = page.getByRole('button', { name: 'Confirmar pedido' })
  const submitAttempts = await confirm.evaluate((element) => {
    const submitter = element as HTMLButtonElement
    const form = submitter.form
    if (!form) throw new Error('Checkout submitter has no form')

    let attempts = 0
    form.addEventListener('submit', () => {
      attempts += 1
    })
    form.requestSubmit(submitter)
    form.requestSubmit(submitter)
    return attempts
  })
  expect(submitAttempts).toBe(2)

  await expect(page).toHaveURL(`/pedido-confirmado/${data.orderId}`)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Pedido criado' }),
  ).toBeVisible()
  await expect(page.getByText('Pedido', { exact: true })).toBeVisible()
  await expect(
    page.getByText(String(data.orderId), { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Criado', { exact: true })).toBeVisible()
  await expect(page.getByText('Cartao', { exact: true })).toBeVisible()
  await expect(
    page.getByText(/R\$\s10\.499,70/, { exact: true }),
  ).toBeVisible()
  expect(authApi.customerSnapshot()).toEqual(profileBeforeCheckout)
  expect(authApi.customerSnapshot()?.endereco.logradouro).toBe(data.street)
  const emptyCartLink = page.getByLabel('Carrinho', { exact: true })
  await expect(emptyCartLink).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Carrinho com \d+ itens?/ }),
  ).toHaveCount(0)

  await emptyCartLink.click()
  await expect(page).toHaveURL('/carrinho')
  await expect(
    page.getByRole('heading', { name: 'Seu carrinho está vazio' }),
  ).toBeVisible()
  await expect(page.getByLabel('Carrinho', { exact: true })).toBeVisible()
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 2,
    profile: 1,
    orderCreate: 1,
  })
})
