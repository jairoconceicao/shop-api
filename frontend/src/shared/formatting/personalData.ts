const CPF_DIGIT_LIMIT = 11
const POSTAL_CODE_DIGIT_LIMIT = 8
const CELL_PHONE_DIGIT_LIMIT = 11

function normalizeDigits(value: string, limit: number): string {
  return value.replace(/\D/g, '').slice(0, limit)
}

export function normalizeCpf(value: string): string {
  return normalizeDigits(value, CPF_DIGIT_LIMIT)
}

export function formatCpf(value: string): string {
  const digits = normalizeCpf(value)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function normalizePostalCode(value: string): string {
  return normalizeDigits(value, POSTAL_CODE_DIGIT_LIMIT)
}

export function formatPostalCode(value: string): string {
  const digits = normalizePostalCode(value)

  if (digits.length <= 5) return digits

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function normalizeCellPhone(value: string): string {
  return normalizeDigits(value, CELL_PHONE_DIGIT_LIMIT)
}

export function formatCellPhone(value: string): string {
  const digits = normalizeCellPhone(value)

  if (digits.length === 0) return ''
  if (digits.length < 3) return `(${digits}`

  const areaCode = digits.slice(0, 2)
  const subscriberNumber = digits.slice(2)

  if (subscriberNumber.length <= 4) return `(${areaCode}) ${subscriberNumber}`

  const prefixLength = subscriberNumber.length <= 8 ? 4 : 5

  return `(${areaCode}) ${subscriberNumber.slice(0, prefixLength)}-${subscriberNumber.slice(prefixLength)}`
}

export type NormalizedCellPhone = {
  ddd: string
  numero: string
}

export function splitCellPhone(value: string): NormalizedCellPhone {
  const digits = normalizeCellPhone(value)

  return {
    ddd: digits.slice(0, 2),
    numero: digits.slice(2),
  }
}
