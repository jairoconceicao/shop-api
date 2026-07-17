import { apiErrorResponseSchema } from '../contracts/apiEnvelopes'

export type AppErrorKind = 'http' | 'network' | 'contract'

type AppErrorOptions = {
  kind: AppErrorKind
  message: string
  status?: number
  code?: string
  details?: unknown
  cause?: unknown
}

export class AppError extends Error {
  readonly kind: AppErrorKind
  readonly status?: number
  readonly code?: string
  readonly details?: unknown

  constructor({ kind, message, status, code, details, cause }: AppErrorOptions) {
    super(message, { cause })
    this.name = 'AppError'
    this.kind = kind
    this.status = status
    this.code = code
    this.details = details
  }
}

const HTTP_FALLBACK_MESSAGES: Partial<Record<number, string>> = {
  400: 'A requisição enviada é inválida.',
  401: 'Sua sessão não é válida. Entre novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'O recurso solicitado não foi encontrado.',
  409: 'A solicitação entra em conflito com o estado atual.',
  422: 'Não foi possível validar os dados enviados.',
}

const DEFAULT_HTTP_MESSAGE = 'Não foi possível concluir a solicitação.'
const SERVER_ERROR_MESSAGE = 'O serviço está indisponível no momento. Tente novamente em alguns instantes.'
const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.'
const CONTRACT_ERROR_MESSAGE = 'A resposta recebida pelo serviço é inválida. Tente novamente.'

export function mapHttpError(status: number, body: unknown): AppError {
  const parsedBody = apiErrorResponseSchema.safeParse(body)
  const apiError = parsedBody.success ? parsedBody.data.error : undefined
  const isServerError = status >= 500

  return new AppError({
    kind: 'http',
    status,
    message: isServerError
      ? SERVER_ERROR_MESSAGE
      : apiError?.message || HTTP_FALLBACK_MESSAGES[status] || DEFAULT_HTTP_MESSAGE,
    code: isServerError ? undefined : apiError?.code,
    details: isServerError ? undefined : apiError?.details,
  })
}

export function mapNetworkError(cause?: unknown): AppError {
  return new AppError({
    kind: 'network',
    message: NETWORK_ERROR_MESSAGE,
    cause,
  })
}

export function mapContractError(cause?: unknown): AppError {
  return new AppError({
    kind: 'contract',
    message: CONTRACT_ERROR_MESSAGE,
    cause,
  })
}
