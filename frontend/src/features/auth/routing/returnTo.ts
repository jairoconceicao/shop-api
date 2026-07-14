export type LoginLocationState = {
  returnTo?: unknown
}

export function getInternalReturnTo(state: unknown, fallback = '/') {
  const returnTo = (state as LoginLocationState | null)?.returnTo

  if (typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return fallback
  }

  try {
    const url = new URL(returnTo, 'https://shop-api.local')

    return url.origin === 'https://shop-api.local' && !returnTo.includes('\\')
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback
  } catch {
    return fallback
  }
}
