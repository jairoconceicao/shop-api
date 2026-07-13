export type TransportNumber = number | string

export function normalizeNumber(value: TransportNumber): number {
  if (typeof value === 'string' && value.trim() === '') {
    throw new TypeError('Numeric value cannot be empty')
  }

  const normalizedValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(normalizedValue)) {
    throw new TypeError('Numeric value must be finite')
  }

  return normalizedValue
}

export function normalizeId(value: TransportNumber): number {
  const normalizedId = normalizeNumber(value)

  if (!Number.isSafeInteger(normalizedId)) {
    throw new TypeError('ID must be a safe integer')
  }

  return normalizedId
}
