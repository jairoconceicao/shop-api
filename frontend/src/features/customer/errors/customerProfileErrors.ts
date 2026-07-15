import type { AppError } from '../../../shared/errors/appError'
import type { CustomerProfileFormValues } from '../contracts/customerProfile'

type FormField = keyof CustomerProfileFormValues
type FieldError = { field: FormField; message: string }

const FIELD_MAP: Record<string, FormField> = {
  cpf: 'cpf', nome: 'nome', datanascimento: 'dataNascimento', email: 'email',
  'endereco.logradouro': 'logradouro', 'endereco.numero': 'numero',
  'endereco.complemento': 'complemento', 'endereco.cep': 'cep',
  'endereco.bairro': 'bairro', 'endereco.cidade': 'cidade', 'endereco.uf': 'uf',
  'celular.ddd': 'ddd', 'celular.numero': 'celularNumero', 'celular.whatsapp': 'whatsApp',
}

export function mapCustomerProfileError(error: AppError): { fields: FieldError[]; summary: string[] } {
  if (error.kind === 'http' && error.status === 422) {
    const details = Array.isArray(error.details) ? error.details : []
    const fields: FieldError[] = []
    const summary: string[] = []
    let malformed = false
    for (const detail of details) {
      if (!detail || typeof detail !== 'object') { malformed = true; continue }
      const propertyName = 'propertyName' in detail ? detail.propertyName : undefined
      const message = 'message' in detail ? detail.message : undefined
      if (typeof propertyName !== 'string' || typeof message !== 'string' || !message) { malformed = true; continue }
      const field = FIELD_MAP[propertyName.toLowerCase()]
      if (field) fields.push({ field, message }); else summary.push(message)
    }
    if (malformed || (fields.length === 0 && summary.length === 0)) summary.push(error.message)
    return { fields, summary }
  }
  if (error.kind === 'network') return { fields: [], summary: ['Não foi possível conectar. Verifique sua conexão e tente novamente.'] }
  if (error.kind === 'contract') return { fields: [], summary: ['A resposta do serviço é inválida. Tente novamente.'] }
  const messages: Record<number, string> = {
    403: 'Você não tem permissão para atualizar estes dados.',
    404: 'Seu perfil não foi encontrado.',
    409: 'Já existe outro cliente com estes dados.',
  }
  const message = error.status && error.status >= 500
    ? 'O serviço está indisponível. Tente novamente.'
    : (error.status ? messages[error.status] : undefined) ?? error.message
  return { fields: [], summary: [message] }
}
