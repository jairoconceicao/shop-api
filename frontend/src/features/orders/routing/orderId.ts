const canonicalPositiveInteger = /^[1-9]\d*$/

export function parseOrderId(value: string | undefined): number | undefined {
  if (!value || !canonicalPositiveInteger.test(value)) return undefined
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : undefined
}
