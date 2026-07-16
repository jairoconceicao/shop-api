import { expect, test } from './fixtures'

test('exige login e um novo clique antes de adicionar o produto ao carrinho', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  const returnTo = `/produtos/${data.product.id}?origem=task-118#comprar`

  authApi.seedCustomer()
  authApi.expectRequestCounts({
    login: 1,
    categories: 1,
    product: 2,
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 2,
  })

  await page.goto(returnTo)
  await expect(
    page.getByRole('heading', { level: 1, name: data.product.title }),
  ).toBeVisible()

  const quantity = page.getByRole('spinbutton', { name: 'Quantidade' })
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(quantity).toHaveValue('3')

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()

  await expect(page).toHaveURL('/entrar')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Entrar na sua conta' }),
  ).toBeVisible()
  expect(authApi.requestCounts()).toMatchObject({
    cartCreate: 0,
    cartAdd: 0,
    cartGet: 0,
  })

  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page).toHaveURL(returnTo)
  await expect(
    page.getByRole('heading', { level: 1, name: data.product.title }),
  ).toBeVisible()
  await expect(
    page.getByRole('spinbutton', { name: 'Quantidade' }),
  ).toHaveValue('1')
  expect(authApi.requestCounts()).toMatchObject({
    login: 1,
    cartCreate: 0,
    cartAdd: 0,
    cartGet: 0,
  })

  await expect
    .poll(async () =>
      page.evaluate(() => ({
        local: localStorage.getItem('shop-api:auth'),
        session: sessionStorage.getItem('shop-api:auth'),
        cart: localStorage.getItem('shop-api:cart-session'),
      })),
    )
    .toEqual({
      local: null,
      session: expect.stringContaining(data.email),
      cart: null,
    })

  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()

  await expect(
    page.getByRole('status').filter({
      hasText: 'Produto adicionado ao carrinho',
    }),
  ).toBeVisible()
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 2,
  })
})
