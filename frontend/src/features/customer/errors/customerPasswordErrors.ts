import type { AppError } from '../../../shared/errors/appError'

export type PasswordField = 'senhaAtual' | 'senhaNova'

const fields: Record<string, PasswordField> = {
  senhaatual: 'senhaAtual', senhanova: 'senhaNova',
}

export function mapCustomerPasswordError(error: AppError) {
  const mapped: { field: PasswordField; message: string }[] = []
  const summary: string[] = []
  if (error.kind === 'http' && error.status === 422) {
    const details = Array.isArray(error.details) ? error.details : []
    let malformed = false
    for (const detail of details) {
      if (!detail || typeof detail !== 'object') { malformed = true; continue }
      const name = 'propertyName' in detail ? detail.propertyName : undefined
      const message = 'message' in detail ? detail.message : undefined
      if (typeof name !== 'string' || typeof message !== 'string' || !message) { malformed = true; continue }
      const field = fields[name.toLowerCase()]
      if (field) mapped.push({ field, message }); else summary.push(message)
    }
    if (malformed || (mapped.length === 0 && summary.length === 0)) summary.push(error.message)
    return { fields: mapped, summary }
  }
  if (error.kind === 'network') return { fields: mapped, summary: ['Não foi possível conectar. Verifique sua conexão e tente novamente.'] }
  if (error.kind === 'contract') return { fields: mapped, summary: ['A resposta do serviço é inválida. Tente novamente.'] }
  const message = error.status && error.status >= 500
    ? 'O serviço está indisponível. Tente novamente.'
    : error.status === 403 ? 'Sua sessão não permite alterar esta senha.' : error.message
  return { fields: mapped, summary: [message] }
}
