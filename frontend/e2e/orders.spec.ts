import { expect, test } from './fixtures'

test('filtra pedidos e mantém o status confirmado após cancelamento recusado', async ({
  authApi,
  page,
}) => {
  const { data } = authApi

  authApi.seedCustomer()
  authApi.expectRequestCounts({
    login: 2,
    categories: 5,
    catalog: 1,
    profile: 1,
    ordersList: 2,
    orderDetail: 4,
    product: 1,
    orderProduct: 3,
    orderCancel: 1,
  })

  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  const keepConnected = page.getByRole('checkbox', {
    name: 'Manter conectado',
  })
  await keepConnected.check()
  await expect(keepConnected).toBeChecked()
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect
    .poll(() => authApi.requestCounts())
    .toMatchObject({ categories: 1, catalog: 1 })
  await expect(page).toHaveURL('/')
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem('shop-api:auth')),
    )
    .toContain(data.email)

  await page.getByRole('button', { name: 'Área do cliente' }).click()
  await page.getByRole('menuitem', { name: 'Meus pedidos' }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus pedidos' }),
  ).toBeVisible()
  await expect(
    page.getByRole('article', { name: `Pedido ${data.orderId}` }),
  ).toBeVisible()
  await expect(
    page.getByRole('article', { name: `Pedido ${data.secondaryOrderId}` }),
  ).toBeVisible()

  await page.getByLabel('Data inicial').fill('2026-07-01')
  await page.getByLabel('Data final').fill('2026-07-15')
  await page.getByRole('button', { name: 'Aplicar período' }).click()

  await expect(page).toHaveURL(
    '/pedidos?dataInicio=2026-07-01&dataFim=2026-07-15',
  )
  const targetCard = page.getByRole('article', {
    name: `Pedido ${data.orderId}`,
  })
  await expect(targetCard).toBeVisible()
  await expect(
    page.getByRole('article', { name: `Pedido ${data.secondaryOrderId}` }),
  ).toHaveCount(0)
  await expect(targetCard.getByText('Criado', { exact: true })).toBeVisible()

  await targetCard
    .getByRole('link', { name: `Ver pedido ${data.orderId}` })
    .click()
  await expect(page).toHaveURL(`/pedidos/${data.orderId}`)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: `Pedido ${data.orderId}`,
    }),
  ).toBeVisible()

  const summary = page.getByRole('region', { name: 'Resumo' })
  await expect(summary.getByText('Criado', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('link', { name: data.product.title }),
  ).toHaveCount(2)
  const items = page.getByRole('region', { name: 'Itens confirmados' })
  const rows = items.getByRole('listitem')
  await expect(rows).toHaveCount(2)
  await expect(rows.nth(0).getByText('Quantidade: 2')).toBeVisible()
  await expect(
    rows.nth(0).getByText(/R\$\s3\.499,90 cada/, { exact: true }),
  ).toBeVisible()
  await expect(
    rows.nth(0).getByText(/R\$\s6\.999,80/, { exact: true }),
  ).toBeVisible()
  await expect(rows.nth(1).getByText('Quantidade: 1')).toBeVisible()
  await expect(
    rows.nth(1).getByText(/R\$\s3\.000,10 cada/, { exact: true }),
  ).toBeVisible()
  await expect(
    rows.nth(1).getByText(/^R\$\s3\.000,10$/, { exact: true }),
  ).toBeVisible()
  await expect(
    items.getByText(/R\$\s9\.999,90/, { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar pedido' }).click()
  const dialog = page.getByRole('dialog', { name: 'Cancelar pedido' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(
    'Confirme se deseja solicitar o cancelamento deste pedido.',
  )
  await dialog.getByRole('button', { name: 'Cancelar pedido' }).click()

  const refusal = page.getByRole('alert')
  await expect(refusal).toContainText('O cancelamento não foi aceito')
  await expect(refusal).toContainText(
    'A API recusou a alteração. O estado mais recente disponível do pedido está sendo exibido.',
  )
  await expect(summary.getByText('Criado', { exact: true })).toBeVisible()
  await expect
    .poll(() => authApi.requestCounts())
    .toMatchObject({ orderDetail: 2, orderCancel: 1 })

  await page
    .getByRole('link', { name: data.product.title })
    .first()
    .click()
  await expect(
    page.getByRole('heading', { level: 1, name: data.product.title }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { level: 1, name: data.product.title }),
  ).toBeVisible()
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    categories: 2,
    product: 1,
    orderProduct: 1,
  })

  await page.evaluate(() => {
    localStorage.removeItem('shop-api:auth')
    sessionStorage.removeItem('shop-api:auth')
  })
  await page.goto(`/pedidos/${data.orderId}`)
  await expect(page).toHaveURL('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('checkbox', { name: 'Manter conectado' }).check()
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(`/pedidos/${data.orderId}`)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: `Pedido ${data.orderId}`,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: data.product.title }),
  ).toHaveCount(2)

  await page.reload()
  await expect(page).toHaveURL(`/pedidos/${data.orderId}`)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: `Pedido ${data.orderId}`,
    }),
  ).toBeVisible()
  await expect(
    page
      .getByRole('region', { name: 'Resumo' })
      .getByText('Criado', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: data.product.title }),
  ).toHaveCount(2)
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    ordersList: 2,
    orderDetail: 4,
    orderProduct: 3,
    orderCancel: 1,
    categories: 5,
    product: 1,
  })
})
