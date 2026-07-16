import AxeBuilder from '@axe-core/playwright'
import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

export async function auditAxe(page: Page, testInfo: TestInfo, state: string) {
  const result = await new AxeBuilder({ page }).analyze()
  await testInfo.attach(`accessibility-${state}.json`, {
    body: Buffer.from(JSON.stringify(result, null, 2)),
    contentType: 'application/json',
  })
  const blocking = result.violations.filter(
    ({ impact }) => impact === 'serious' || impact === 'critical',
  )
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  return result
}

export async function attachAccessibilityScreenshot(
  page: Page,
  testInfo: TestInfo,
  state: string,
) {
  await testInfo.attach(`accessibility-${state}.png`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
}

export async function assertDocumentSemantics(page: Page) {
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  const unnamed = await page.locator(
    'a[href],button,input,select,textarea,[role="menu"],[role="dialog"],nav,form[role="search"]',
  ).evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element)
      return style.display !== 'none' && style.visibility !== 'hidden'
        && element.getAttribute('aria-hidden') !== 'true'
    })
    .filter((element) => {
      const html = element as HTMLElement
      const label = element.getAttribute('aria-label')
        ?? (element.getAttribute('aria-labelledby')
          ? document.getElementById(element.getAttribute('aria-labelledby')!)?.textContent
          : null)
        ?? (element instanceof HTMLInputElement
          ? element.closest('label')?.textContent
            ?? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(element.id)}"]`)?.textContent
          : null)
        ?? html.innerText
        ?? element.getAttribute('title')
      return !label?.trim()
    })
    .map((element) => element.outerHTML))
  expect(unnamed, `Controles/landmarks sem nome: ${unnamed.join('\n')}`).toEqual([])

  const visibleSearches = page.getByRole('search', { name: 'Buscar produtos' })
  if (await visibleSearches.count() > 0) await expect(visibleSearches).toHaveCount(1)
}

export async function assertVisibleFocus(locator: Locator) {
  await expect(locator).toBeFocused()
  const result = await locator.evaluate((element) => {
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return {
      positiveBox: rect.width > 0 && rect.height > 0,
      indicator: (
        style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) >= 2
      ) || style.boxShadow !== 'none',
    }
  })
  expect(result.positiveBox).toBe(true)
  expect(result.indicator).toBe(true)
}

export async function assertLiveRegions(page: Page) {
  const findings = await page.locator('[role="alert"],[role="status"],[aria-live]').evaluateAll(
    (elements) => elements.flatMap((element) => {
      const style = getComputedStyle(element)
      if (style.display === 'none' || style.visibility === 'hidden') return []
      const text = element.textContent?.trim() ?? ''
      if (!text) return []
      const role = element.getAttribute('role')
      const live = element.getAttribute('aria-live')
      const expected = role === 'alert' ? 'assertive' : role === 'status' ? 'polite' : live
      return expected === live || (role === 'alert' && live === null)
        || (role === 'status' && live === null)
        ? []
        : [`${role ?? 'region'} "${text}" deveria usar aria-live=${expected}`]
    }),
  )
  expect(findings).toEqual([])
}

export async function auditTextContrast(page: Page, testInfo: TestInfo, state: string) {
  const report = await page.locator('body').evaluate(() => {
    type Rgba = { r: number; g: number; b: number; a: number }
    const parse = (value: string): Rgba | null => {
      const parts = value.match(/[\d.]+/g)?.map(Number)
      if (!parts || parts.length < 3) return null
      if (value.startsWith('oklch(')) {
        const [lightness, chroma, hue, alpha = 1] = parts
        const angle = hue * Math.PI / 180
        const l = lightness
        const a = chroma * Math.cos(angle)
        const b = chroma * Math.sin(angle)
        const lPrime = l + 0.3963377774 * a + 0.2158037573 * b
        const mPrime = l - 0.1055613458 * a - 0.0638541728 * b
        const sPrime = l - 0.0894841775 * a - 1.291485548 * b
        const ll = lPrime ** 3
        const mm = mPrime ** 3
        const ss = sPrime ** 3
        const linear = [
          4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss,
          -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss,
          -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss,
        ]
        const encode = (channel: number) => 255 * (
          channel <= 0.0031308
            ? 12.92 * channel
            : 1.055 * channel ** (1 / 2.4) - 0.055
        )
        return {
          r: encode(linear[0]),
          g: encode(linear[1]),
          b: encode(linear[2]),
          a: alpha,
        }
      }
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 }
    }
    const composite = (fg: Rgba, bg: Rgba): Rgba => {
      const a = fg.a + bg.a * (1 - fg.a)
      return {
        r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
        g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
        b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
        a,
      }
    }
    const luminance = ({ r, g, b }: Rgba) => [r, g, b]
      .map((channel) => channel / 255)
      .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)
    const ratio = (a: Rgba, b: Rgba) => {
      const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
      return (lighter + 0.05) / (darker + 0.05)
    }
    const background = (element: Element) => {
      let color: Rgba = { r: 0, g: 0, b: 0, a: 0 }
      for (let node: Element | null = element; node; node = node.parentElement) {
        const parsed = parse(getComputedStyle(node).backgroundColor)
        if (parsed) color = composite(color, parsed)
        if (color.a >= 0.999) return color
      }
      return composite(color, { r: 255, g: 255, b: 255, a: 1 })
    }
    return [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((element) => element.childNodes.length > 0
        && [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
        && element.getClientRects().length > 0
        && !element.closest(':disabled,[aria-disabled="true"]'))
      .map((element) => {
        const style = getComputedStyle(element)
        const foreground = composite(parse(style.color)!, background(element))
        const bg = background(element)
        const fontSize = Number.parseFloat(style.fontSize)
        const fontWeight = Number.parseInt(style.fontWeight, 10) || 400
        const threshold = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5
        return {
          text: element.innerText.trim().slice(0, 100),
          selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`,
          foreground, background: bg, fontSize, fontWeight,
          ratio: ratio(foreground, bg), threshold,
        }
      })
  })
  await testInfo.attach(`contrast-${state}.json`, {
    body: Buffer.from(JSON.stringify(report, null, 2)),
    contentType: 'application/json',
  })
  const failures = report.filter(({ ratio, threshold }) => ratio + 0.01 < threshold)
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([])
}

export async function assertReducedMotion(page: Page) {
  const findings = await page.locator('html').evaluate((root) => {
    const parseTimes = (value: string) => value.split(',').map((part) => {
      const trimmed = part.trim()
      return Number.parseFloat(trimmed) * (trimmed.endsWith('ms') ? 1 : 1000)
    })
    const nodes = [root, ...root.querySelectorAll<HTMLElement>('*')]
    return nodes.flatMap((element) => {
      const style = getComputedStyle(element)
      const maxAnimation = Math.max(...parseTimes(style.animationDuration), 0)
      const maxTransition = Math.max(...parseTimes(style.transitionDuration), 0)
      const iterations = Math.max(...style.animationIterationCount.split(',').map(Number), 0)
      return maxAnimation > 0.01 || maxTransition > 0.01 || iterations > 1
        ? [{ tag: element.tagName, maxAnimation, maxTransition, iterations }]
        : []
    })
  })
  expect(await page.locator('html').evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe('auto')
  expect(findings).toEqual([])
}
