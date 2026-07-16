import type { Locator, Page, TestInfo } from '@playwright/test'

import { expect, test } from './fixtures'
import {
  assertActionableControls,
  assertResponsiveDocument,
  attachResponsiveScreenshot,
  RESPONSIVE_STATES,
  RESPONSIVE_VIEWPORTS,
  type ResponsiveState,
  type ResponsiveViewport,
} from './support/responsiveAudit'

const markersByState: Record<ResponsiveState, readonly string[]> = {
  catalog: ['categories', 'pagination'],
  'product-detail': ['categories'],
  login: [],
  registration: [],
  cart: ['categories'],
  'cart-remove-dialog': ['categories'],
  checkout: ['categories'],
  'order-confirmation': ['categories'],
  'account-data': ['categories', 'account-navigation'],
  'account-password': ['categories', 'account-navigation'],
  'orders-list': ['categories'],
  'order-detail': ['categories'],
  'order-cancel-dialog': ['categories'],
}

async function checkpoint(
  page: Page,
  testInfo: TestInfo,
  viewport: ResponsiveViewport,
  state: ResponsiveState,
  visitedStates: ResponsiveState[],
  scope?: Locator,
) {
  await assertResponsiveDocument(page, markersByState[state])
  await assertActionableControls(page, scope)
  await attachResponsiveScreenshot(page, testInfo, viewport, state)
  visitedStates.push(state)
}

for (const viewport of RESPONSIVE_VIEWPORTS) {
  test.describe(`viewport ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test('audita os 13 estados principais', async ({
      authApi,
      page,
    }, testInfo) => {
      const { data } = authApi
      const visitedStates: ResponsiveState[] = []
      const productPath = `/produtos/${data.product.id}`

      expect(RESPONSIVE_VIEWPORTS).toHaveLength(5)
      expect(RESPONSIVE_STATES).toHaveLength(13)
      expect(RESPONSIVE_VIEWPORTS.length * RESPONSIVE_STATES.length).toBe(65)
      authApi.seedCustomer()
      authApi.enableResponsiveCatalog()

      await page.goto('/')
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: 'Encontre produtos para o seu dia a dia',
        }),
      ).toBeVisible()
      await expect(
        page.getByRole('heading', { level: 2, name: data.product.title }),
      ).toBeVisible()
      await checkpoint(page, testInfo, viewport, 'catalog', visitedStates)

      await page.goto(productPath)
      await expect(
        page.getByRole('heading', { level: 1, name: data.product.title }),
      ).toBeVisible()
      await expect(page.getByRole('spinbutton', { name: 'Quantidade' })).toBeEnabled()
      await checkpoint(page, testInfo, viewport, 'product-detail', visitedStates)

      await page.goto('/entrar')
      const loginForm = page.locator('form')
      await expect(page.getByRole('heading', { name: 'Entrar na sua conta' })).toBeVisible()
      await page.getByLabel('E-mail').fill('audit@example.test')
      await page.getByLabel('Senha').fill('Audit@127')
      await page.getByLabel('E-mail').clear()
      await page.getByLabel('Senha').clear()
      await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeEnabled()
      await checkpoint(page, testInfo, viewport, 'login', visitedStates, loginForm)

      await page.goto('/cadastro')
      const registrationForm = page.locator('form')
      await expect(
        page.getByRole('heading', { name: 'Cadastro de cliente' }),
      ).toBeVisible()
      await page.getByLabel('Nome completo').fill('Auditoria responsiva')
      await page.getByLabel('CPF').fill('12345678901')
      await page.getByLabel('Logradouro').fill('Rua da auditoria')
      await page.getByLabel('Celular', { exact: true }).fill('11999999999')
      await page.getByLabel('Nome completo').clear()
      await page.getByLabel('CPF').clear()
      await page.getByLabel('Logradouro').clear()
      await page.getByLabel('Celular', { exact: true }).clear()
      await expect(page.getByRole('button', { name: 'Criar conta' })).toBeEnabled()
      await checkpoint(
        page,
        testInfo,
        viewport,
        'registration',
        visitedStates,
        registrationForm,
      )

      await page.goto(productPath)
      await expect(
        page.getByRole('heading', { level: 1, name: data.product.title }),
      ).toBeVisible()
      await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
      await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
      await expect(page.getByRole('spinbutton', { name: 'Quantidade' })).toHaveValue('3')
      await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
      await expect(page).toHaveURL('/entrar')
      expect(authApi.requestCounts()).toMatchObject({ cartCreate: 0, cartAdd: 0 })

      await page.getByLabel('E-mail').fill(data.email)
      await page.getByLabel('Senha').fill(data.password)
      await page.getByRole('button', { name: 'Entrar', exact: true }).click()
      await expect(page).toHaveURL(productPath)
      const quantity = page.getByRole('spinbutton', { name: 'Quantidade' })
      if (await quantity.inputValue() !== '3') {
        await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
        await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
      }
      await expect(quantity).toHaveValue('3')
      await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
      await expect.poll(() => authApi.requestCounts()).toMatchObject({
        login: 1,
        cartCreate: 1,
        cartAdd: 1,
      })

      await page.getByRole('link', { name: 'Carrinho com 3 itens' }).click()
      await expect(page).toHaveURL('/carrinho')
      await expect(
        page.getByRole('spinbutton', { name: `Quantidade de ${data.product.title}` }),
      ).toHaveValue('3')
      await checkpoint(page, testInfo, viewport, 'cart', visitedStates)

      await page.getByRole('button', { name: `Remover ${data.product.title}` }).click()
      const removeDialog = page.getByRole('dialog', {
        name: 'Remover item do carrinho?',
      })
      await expect(removeDialog).toBeVisible()
      await expect(removeDialog.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
      await checkpoint(
        page,
        testInfo,
        viewport,
        'cart-remove-dialog',
        visitedStates,
        removeDialog,
      )
      await removeDialog.getByRole('button', { name: 'Cancelar' }).click()

      await page.getByRole('link', { name: 'Ir para checkout' }).click()
      await expect(page.getByRole('heading', { level: 1, name: 'Checkout' })).toBeVisible()
      await page.getByLabel('Logradouro').fill(`${data.street} — somente pedido`)
      await page.getByRole('radio', { name: 'Cartão' }).check()
      await expect(page.getByRole('button', { name: 'Confirmar pedido' })).toBeEnabled()
      await checkpoint(page, testInfo, viewport, 'checkout', visitedStates, page.locator('form'))
      await page.getByRole('button', { name: 'Confirmar pedido' }).click()

      await expect(page).toHaveURL(`/pedido-confirmado/${data.orderId}`)
      await expect(page.getByRole('heading', { level: 1, name: 'Pedido criado' })).toBeVisible()
      await checkpoint(page, testInfo, viewport, 'order-confirmation', visitedStates)

      await page.goto('/minha-conta/dados')
      const accountForm = page.getByRole('form', { name: 'Meus dados' })
      await expect(page.getByRole('heading', { level: 1, name: 'Meus dados' })).toBeVisible()
      await page.getByLabel('Nome completo').fill(`${data.name} auditado`)
      await page.getByLabel('Nome completo').fill(data.name)
      await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled()
      await checkpoint(
        page,
        testInfo,
        viewport,
        'account-data',
        visitedStates,
        accountForm,
      )

      await page.getByRole('link', { name: 'Trocar senha' }).click()
      const passwordForm = page.getByRole('form', { name: 'Alterar senha' })
      await expect(page.getByRole('heading', { level: 1, name: 'Alterar senha' })).toBeVisible()
      await page.getByLabel('Senha atual').fill(data.password)
      await page.getByRole('textbox', { name: 'Nova senha' }).fill('Audit@127')
      await page.getByLabel('Senha atual').clear()
      await page.getByRole('textbox', { name: 'Nova senha' }).clear()
      await expect(page.getByRole('button', { name: 'Alterar senha' })).toBeEnabled()
      await checkpoint(
        page,
        testInfo,
        viewport,
        'account-password',
        visitedStates,
        passwordForm,
      )

      await page.goto('/pedidos')
      await expect(page.getByRole('heading', { level: 1, name: 'Meus pedidos' })).toBeVisible()
      await page.getByLabel('Data inicial').fill('2026-07-01')
      await page.getByLabel('Data final').fill('2026-07-15')
      await page.getByLabel('Data inicial').clear()
      await page.getByLabel('Data final').clear()
      await expect(page.getByRole('button', { name: 'Aplicar período' })).toBeEnabled()
      await checkpoint(page, testInfo, viewport, 'orders-list', visitedStates)

      const orderCard = page.getByRole('article', { name: `Pedido ${data.orderId}` })
      await orderCard.getByRole('link', { name: `Ver pedido ${data.orderId}` }).click()
      await expect(
        page.getByRole('heading', { level: 1, name: `Pedido ${data.orderId}` }),
      ).toBeVisible()
      await expect(page.getByRole('link', { name: data.product.title })).toHaveCount(2)
      await checkpoint(page, testInfo, viewport, 'order-detail', visitedStates)

      await page.getByRole('button', { name: 'Cancelar pedido' }).click()
      const cancelDialog = page.getByRole('dialog', { name: 'Cancelar pedido' })
      await expect(cancelDialog).toBeVisible()
      await expect(cancelDialog.getByRole('button', { name: 'Voltar' })).toBeEnabled()
      await checkpoint(
        page,
        testInfo,
        viewport,
        'order-cancel-dialog',
        visitedStates,
        cancelDialog,
      )
      await cancelDialog.getByRole('button', { name: 'Voltar' }).click()

      expect(visitedStates).toEqual([...RESPONSIVE_STATES])
      expect(authApi.requestCounts()).toMatchObject({
        login: 1,
        cartCreate: 1,
        cartAdd: 1,
      })
      authApi.expectRequestCounts({
        register: 0,
        login: 1,
        categories: 5,
        catalog: 1,
        profile: 3,
        profileUpdate: 0,
        passwordUpdate: 0,
        logout: 0,
        product: 3,
        cartCreate: 1,
        cartAdd: 1,
        cartGet: 2,
        cartUpdate: 0,
        cartDelete: 0,
        orderCreate: 1,
        ordersList: 1,
        orderDetail: 1,
        orderProduct: 1,
        orderCancel: 0,
      })
    })
  })
}
