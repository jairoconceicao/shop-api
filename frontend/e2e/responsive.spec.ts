import { expect, test } from './fixtures'
import {
  assertActionableControls,
  assertResponsiveDocument,
  RESPONSIVE_STATES,
  RESPONSIVE_VIEWPORTS,
} from './support/responsiveAudit'

test('define a matriz responsiva literal', () => {
  expect(RESPONSIVE_VIEWPORTS).toHaveLength(5)
  expect(RESPONSIVE_STATES).toHaveLength(13)
  expect(RESPONSIVE_VIEWPORTS.length * RESPONSIVE_STATES.length).toBe(65)
})

test.describe('viewport 320', () => {
  test.use({ viewport: { width: 320, height: 800 } })

  test('audita o catálogo', async ({ authApi, page }) => {
    authApi.expectRequestCounts({ categories: 1, catalog: 1 })
    await page.goto('/')
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Encontre produtos para o seu dia a dia',
      }),
    ).toBeVisible()
    await assertResponsiveDocument(page, ['categories'])
    await assertActionableControls(page)
  })
})
