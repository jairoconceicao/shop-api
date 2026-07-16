import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'

const NOW = '2026-07-16T12:00:00-03:00'
const FIRST_EXPIRATION = '2026-07-16T12:00:05-03:00'
const SECOND_EXPIRATION = '2026-07-16T12:00:15-03:00'

async function seedPersistedSession(
  page: Page,
  session: {
    token: string
    tipo: string
    expiraEm: string
    usuarioId: number
    clienteId: number
    email: string
  },
  cartId: number,
) {
  await page.addInitScript(
    ({ persistedSession, persistedCartId }) => {
      const auth = JSON.stringify({
        state: { session: persistedSession, persistence: 'local' },
        version: 1,
      })
      localStorage.setItem('shop-api:auth', auth)
      sessionStorage.setItem('shop-api:auth', auth)
      localStorage.setItem(
        'shop-api:cart-session',
        JSON.stringify({
          state: {
            cartIdsByCustomer: {
              [String(persistedSession.clienteId)]: persistedCartId,
            },
          },
          version: 1,
        }),
      )
    },
    { persistedSession: session, persistedCartId: cartId },
  )
}

async function expectExpiredClientState(page: Page, customerId: number) {
  await expect(page).toHaveURL('/entrar')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Entrar na sua conta' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus pedidos' }),
  ).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate((id) => {
        const cart = localStorage.getItem('shop-api:cart-session')
        return {
          localAuth: localStorage.getItem('shop-api:auth'),
          sessionAuth: sessionStorage.getItem('shop-api:auth'),
          hasCustomerCart: cart?.includes(`"${id}":`) ?? false,
        }
      }, customerId),
    )
    .toEqual({
      localAuth: null,
      sessionAuth: null,
      hasCustomerCart: false,
    })
}

async function login(page: Page, email: string, password: string) {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('checkbox', { name: 'Manter conectado' }).check()
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

async function expectHistoryAndReloadRemainBlocked(
  page: Page,
  customerId: number,
) {
  await page.evaluate(() => history.pushState({}, '', '/pedidos'))
  await page.goBack()
  await expectExpiredClientState(page, customerId)
  await page.reload()
  await expectExpiredClientState(page, customerId)
}

test('restaura sessão expirada sem expor pedidos e mantém bloqueio após voltar ou recarregar', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  authApi.seedCustomer()
  authApi.setLoginExpirations([FIRST_EXPIRATION])
  authApi.expectRequestCounts({
    login: 1,
    categories: 2,
    profile: 1,
    ordersList: 1,
  })
  await page.clock.install({ time: new Date(NOW) })
  await seedPersistedSession(
    page,
    {
      token: 'expired.header.payload',
      tipo: 'Bearer',
      expiraEm: '2026-07-16T11:59:59-03:00',
      usuarioId: data.userId,
      clienteId: data.customerId,
      email: data.email,
    },
    data.cartId,
  )

  await page.goto('/pedidos?status=criado#pedido')
  await expectExpiredClientState(page, data.customerId)
  expect(authApi.requestCounts()).toMatchObject({
    login: 0,
    profile: 0,
    cartGet: 0,
    ordersList: 0,
    orderDetail: 0,
    orderProduct: 0,
    orderCancel: 0,
  })

  await login(page, data.email, data.password)
  await expect(page).toHaveURL('/pedidos?status=criado#pedido')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus pedidos' }),
  ).toBeVisible()
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    login: 1,
    profile: 1,
    cartGet: 0,
    ordersList: 1,
    orderDetail: 0,
  })

  await page.clock.fastForward('00:00:06')
  await expectExpiredClientState(page, data.customerId)
  await expectHistoryAndReloadRemainBlocked(page, data.customerId)
})

test('expira duas sessões durante o uso sem reabrir pedidos pelo histórico', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  authApi.seedCustomer()
  authApi.setLoginExpirations([FIRST_EXPIRATION, SECOND_EXPIRATION])
  authApi.expectRequestCounts({
    login: 2,
    categories: 2,
    profile: 2,
    ordersList: 2,
  })
  await page.clock.install({ time: new Date(NOW) })

  await page.goto('/pedidos')
  await login(page, data.email, data.password)
  await expect(page).toHaveURL('/pedidos')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus pedidos' }),
  ).toBeVisible()
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    profile: 1,
    ordersList: 1,
  })

  await page.clock.fastForward('00:00:06')
  await expectExpiredClientState(page, data.customerId)
  await login(page, data.email, data.password)
  await expect(page).toHaveURL('/pedidos')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus pedidos' }),
  ).toBeVisible()
  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    profile: 2,
    ordersList: 2,
  })

  await page.clock.fastForward('00:00:10')
  await expectExpiredClientState(page, data.customerId)
  await expectHistoryAndReloadRemainBlocked(page, data.customerId)
})
