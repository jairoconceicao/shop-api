const CANONICAL_POSITIVE_INTEGER = /^[1-9]\d*$/

export function parseProductId(value: string | undefined): number | undefined {
  if (!value || !CANONICAL_POSITIVE_INTEGER.test(value)) {
    return undefined
  }

  const productId = Number(value)

  return Number.isSafeInteger(productId) ? productId : undefined
}
