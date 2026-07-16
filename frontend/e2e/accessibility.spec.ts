import { type Locator, type Page } from '@playwright/test'

import { expect, test } from './fixtures'
import {
  assertDocumentSemantics,
  assertLiveRegions,
  assertReducedMotion,
  assertVisibleFocus,
  attachAccessibilityScreenshot,
  auditAxe,
  auditTextContrast,
} from './support/accessibilityAudit'

async function tabUntil(page: Page, target: Locator, max = 80) {
  for (let index = 0; index < max; index += 1) {
    await page.keyboard.press('Tab')
    if (await target.evaluate((element) => element === document.activeElement).catch(() => false)) {
      return
    }
  }
  throw new Error(`Alvo não alcançado por Tab após ${max} passos`)
}

async function activateByKeyboard(page: Page, target: Locator, key = 'Enter') {
  await tabUntil(page, target)
  await assertVisibleFocus(target)
  await page.keyboard.press(key)
}

async function auditState(page: Page, testInfo: Parameters<typeof auditAxe>[1], state: string) {
  await assertDocumentSemantics(page)
  await assertLiveRegions(page)
  await auditAxe(page, testInfo, state)
  await auditTextContrast(page, testInfo, state)
  await attachAccessibilityScreenshot(page, testInfo, state)
}

async function assertDialogKeyboard(page: Page, dialog: Locator, trigger: Locator) {
  await expect(dialog).toBeVisible()
  const safeAction = dialog.getByRole('button', { name: /^(Cancelar|Voltar)$/ })
  await expect(safeAction).toBeFocused()
  const focusableCount = await dialog.locator('button:not(:disabled),a[href],input:not(:disabled)').count()
  for (let index = 0; index <= focusableCount; index += 1) await page.keyboard.press('Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.locator(':focus')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
}

test('audita as jornadas principais por teclado', async ({ authApi, page }, testInfo) => {
  const { data } = authApi
  authApi.seedCustomer()

  await page.goto('/entrar')
  await activateByKeyboard(page, page.getByLabel('E-mail'))
  await page.keyboard.type('email-invalido')
  await activateByKeyboard(page, page.getByRole('button', { name: 'Entrar', exact: true }))
  const loginSummary = page.getByRole('alert')
  await expect(loginSummary).toBeFocused()
  await expect(page.getByLabel('Senha')).toHaveAttribute('aria-invalid', 'true')
  await auditState(page, testInfo, 'login-error')

  const createNow = page.getByRole('link', { name: 'Criar agora' })
  await activateByKeyboard(page, createNow)
  await expect(page).toHaveURL('/cadastro')
  await expect(page.getByRole('heading', { level: 1, name: 'Cadastro de cliente' })).toBeFocused()
  await activateByKeyboard(page, page.getByRole('button', { name: 'Criar conta' }))
  await expect(page.getByRole('alert')).toBeFocused()
  await auditState(page, testInfo, 'registration-error')

  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await activateByKeyboard(page, page.getByRole('checkbox', { name: 'Manter conectado' }), 'Space')
  await activateByKeyboard(page, page.getByRole('button', { name: 'Entrar', exact: true }))
  await expect(page).toHaveURL('/')
  await auditState(page, testInfo, 'catalog')

  const accountTrigger = page.getByRole('button', { name: 'Área do cliente' })
  await tabUntil(page, accountTrigger)
  await assertVisibleFocus(accountTrigger)
  await page.keyboard.press('ArrowDown')
  const menu = page.getByRole('menu')
  const menuItems = menu.getByRole('menuitem')
  await expect(menuItems.first()).toBeFocused()
  await page.keyboard.press('End')
  await expect(menuItems.last()).toBeFocused()
  await page.keyboard.press('Home')
  await expect(menuItems.first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(accountTrigger).toBeFocused()

  await page.goto(`/produtos/${data.product.id}`)
  const increase = page.getByRole('button', { name: 'Aumentar quantidade' })
  await activateByKeyboard(page, increase)
  await activateByKeyboard(page, increase)
  await activateByKeyboard(page, page.getByRole('button', { name: 'Adicionar ao carrinho' }))
  await activateByKeyboard(page, page.getByRole('link', { name: /Carrinho com 3 itens/ }))
  const removeTrigger = page.getByRole('button', { name: `Remover ${data.product.title}` })
  await activateByKeyboard(page, removeTrigger)
  const removeDialog = page.getByRole('dialog', { name: 'Remover item do carrinho?' })
  await auditState(page, testInfo, 'cart-dialog')
  await assertDialogKeyboard(page, removeDialog, removeTrigger)

  await page.goto('/checkout')
  await expect(page.getByRole('heading', { level: 1, name: 'Checkout' })).toBeVisible()
  await tabUntil(page, page.getByRole('button', { name: /Confirmar pedido/ }))
  await assertVisibleFocus(page.getByRole('button', { name: /Confirmar pedido/ }))
  await auditState(page, testInfo, 'checkout')

  await page.goto('/minha-conta/dados')
  const cpf = page.getByLabel('CPF')
  await cpf.fill(`8000000${data.cpf.slice(-4)}`)
  const save = page.getByRole('button', { name: 'Salvar alterações' })
  await activateByKeyboard(page, save)
  const cpfDialog = page.getByRole('dialog', { name: 'Confirmar alteração do CPF' })
  await auditState(page, testInfo, 'account-cpf-dialog')
  await assertDialogKeyboard(page, cpfDialog, save)

  await page.goto(`/pedidos/${data.orderId}`)
  const cancelOrder = page.getByRole('button', { name: 'Cancelar pedido' })
  await activateByKeyboard(page, cancelOrder)
  const orderDialog = page.getByRole('dialog', { name: 'Cancelar pedido' })
  await auditState(page, testInfo, 'order-dialog')
  await assertDialogKeyboard(page, orderDialog, cancelOrder)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await assertReducedMotion(page)

  authApi.expectRequestCounts({
    login: 1,
    categories: 6,
    catalog: 1,
    profile: 2,
    product: 2,
    cartCreate: 1,
    cartAdd: 1,
    cartGet: 6,
    ordersList: 0,
    orderDetail: 1,
    orderProduct: 1,
  })
})
