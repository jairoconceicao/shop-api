import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

export const RESPONSIVE_VIEWPORTS = [
  { name: '320', width: 320, height: 800 },
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1920', width: 1920, height: 1080 },
] as const

export const RESPONSIVE_STATES = [
  'catalog',
  'product-detail',
  'login',
  'registration',
  'cart',
  'cart-remove-dialog',
  'checkout',
  'order-confirmation',
  'account-data',
  'account-password',
  'orders-list',
  'order-detail',
  'order-cancel-dialog',
] as const

export type ResponsiveViewport = (typeof RESPONSIVE_VIEWPORTS)[number]
export type ResponsiveState = (typeof RESPONSIVE_STATES)[number]

type OverflowAudit = {
  document: { scrollWidth: number; clientWidth: number }
  allowedMarkers: string[]
  offenders: Array<{
    tag: string
    marker: string | null
    label: string
    scrollWidth: number
    clientWidth: number
    left: number
    right: number
  }>
}

const ALLOWED_MARKERS = [
  'categories',
  'account-navigation',
  'pagination',
] as const

export async function assertResponsiveDocument(
  page: Page,
  expectedMarkers: readonly string[],
) {
  const audit = await page.evaluate<OverflowAudit, readonly string[]>(
    (knownMarkers) => {
      const root = document.documentElement
      const markerElements = [
        ...document.querySelectorAll<HTMLElement>(
          '[data-responsive-overflow]',
        ),
      ]
      const allowedMarkerSet = new Set(knownMarkers)
      const markerCounts = new Map<string, number>()
      const invalidMarkers: string[] = []

      for (const element of markerElements) {
        const marker = element.dataset.responsiveOverflow ?? ''
        markerCounts.set(marker, (markerCounts.get(marker) ?? 0) + 1)
        if (!allowedMarkerSet.has(marker)) invalidMarkers.push(marker)
      }

      const duplicatedMarkers = [...markerCounts.entries()]
        .filter(([, count]) => count !== 1)
        .map(([marker]) => marker)
      const markerPolicyInvalid =
        invalidMarkers.length > 0
        || duplicatedMarkers.length > 0
        || markerElements.length > knownMarkers.length

      const isVisible = (element: HTMLElement) => {
        const style = window.getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) !== 0
          && style.clip !== 'rect(0px, 0px, 0px, 0px)'
          && style.clipPath !== 'inset(50%)'
          && rect.width > 0
          && rect.height > 0
      }

      const offenders = [
        ...document.querySelectorAll<HTMLElement>('body *'),
      ].flatMap((element) => {
        if (!isVisible(element)) return []

        const rect = element.getBoundingClientRect()
        const markerContainer = element.closest<HTMLElement>(
          '[data-responsive-overflow]',
        )
        const isMarker = markerContainer === element
        const isEditableControl = [
          'INPUT',
          'SELECT',
          'TEXTAREA',
        ].includes(element.tagName)
        const escapesDocument = rect.left < 0 || rect.right > root.clientWidth
        const hasUnallowedInternalOverflow =
          element.scrollWidth > element.clientWidth
          && markerContainer === null
          && !isEditableControl
          && !['hidden', 'clip'].includes(
            window.getComputedStyle(element).overflowX,
          )

        if (
          !escapesDocument
          && !hasUnallowedInternalOverflow
          && !(isMarker && markerPolicyInvalid)
        ) {
          return []
        }
        if (markerContainer !== null && !isMarker) return []

        return [{
          tag: element.tagName.toLowerCase(),
          marker: element.dataset.responsiveOverflow ?? null,
          label:
            element.getAttribute('aria-label')
            ?? element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120)
            ?? '',
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          left: rect.left,
          right: rect.right,
        }]
      })

      if (markerPolicyInvalid) {
        offenders.push({
          tag: 'marker-policy',
          marker: [
            ...invalidMarkers,
            ...duplicatedMarkers,
          ].join(',') || null,
          label: 'Unknown, duplicated, or excess responsive overflow marker',
          scrollWidth: markerElements.length,
          clientWidth: knownMarkers.length,
          left: 0,
          right: 0,
        })
      }

      return {
        document: {
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
        },
        allowedMarkers: markerElements.map(
          (element) => element.dataset.responsiveOverflow ?? '',
        ),
        offenders,
      }
    },
    ALLOWED_MARKERS,
  )

  const diagnostic = JSON.stringify(audit, null, 2)
  expect(
    audit.document.scrollWidth,
    `Responsive document overflow:\n${diagnostic}`,
  ).toBeLessThanOrEqual(audit.document.clientWidth)
  expect(audit.offenders, `Responsive offenders:\n${diagnostic}`).toEqual([])
  expect(
    [...audit.allowedMarkers].sort(),
    `Responsive markers:\n${diagnostic}`,
  ).toEqual([...expectedMarkers].sort())

  return audit
}

export async function assertActionableControls(
  page: Page,
  scope: Locator = page.locator('body'),
) {
  const controls = scope.locator('a[href], button, input, select, textarea')
  const viewport = page.viewportSize()
  if (viewport === null) throw new Error('Responsive audit requires a viewport')

  const findings = await controls.evaluateAll(
    (elements, width) =>
      elements.flatMap((element) => {
        const control = element as HTMLElement & { disabled?: boolean }
        const style = window.getComputedStyle(control)
        const rect = control.getBoundingClientRect()
        const visible =
          style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) !== 0
          && rect.width > 0
          && rect.height > 0
        if (!visible || control.disabled) return []

        const valid =
          rect.width > 0
          && rect.height > 0
          && rect.left >= 0
          && rect.right <= width
        return valid
          ? []
          : [{
              tag: control.tagName.toLowerCase(),
              label:
                control.getAttribute('aria-label')
                ?? control.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120)
                ?? '',
              left: rect.left,
              right: rect.right,
              width: rect.width,
            }]
      }),
    viewport.width,
  )

  expect(
    findings,
    `Controls outside viewport:\n${JSON.stringify(findings, null, 2)}`,
  ).toEqual([])
}

export async function attachResponsiveScreenshot(
  page: Page,
  testInfo: TestInfo,
  viewport: ResponsiveViewport,
  state: ResponsiveState,
) {
  await testInfo.attach(`responsive-${viewport.name}-${state}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
}
