import { describe, expect, it } from 'vitest'

import {
  AppError,
  mapContractError,
  mapHttpError,
  mapNetworkError,
} from './appError'

describe('mapHttpError', () => {
  it('maps a valid API error preserving machine-readable data', () => {
    const error = mapHttpError(422, {
      error: {
        code: 'validation_error',
        message: 'Confira os campos informados.',
        details: { email: ['E-mail inválido'] },
      },
    })

    expect(error).toBeInstanceOf(AppError)
    expect(error).toMatchObject({
      name: 'AppError',
      kind: 'http',
      status: 422,
      code: 'validation_error',
      message: 'Confira os campos informados.',
      details: { email: ['E-mail inválido'] },
    })
  })

  it('uses a status fallback when the response body is absent or invalid', () => {
    expect(mapHttpError(404, undefined)).toMatchObject({
      kind: 'http',
      status: 404,
      message: 'O recurso solicitado não foi encontrado.',
    })

    expect(mapHttpError(409, { error: { message: 123 } })).toMatchObject({
      kind: 'http',
      status: 409,
      message: 'A solicitação entra em conflito com o estado atual.',
    })
  })

  it('does not expose server error content', () => {
    expect(
      mapHttpError(500, {
        error: {
          code: 'database_failure',
          message: 'password=secret',
          details: { connectionString: 'sensitive' },
        },
      }),
    ).toMatchObject({
      kind: 'http',
      status: 500,
      code: undefined,
      details: undefined,
      message: 'O serviço está indisponível no momento. Tente novamente em alguns instantes.',
    })
  })
})

describe('mapNetworkError', () => {
  it('maps a transport failure and retains its cause for diagnostics', () => {
    const cause = new TypeError('Failed to fetch')
    const error = mapNetworkError(cause)

    expect(error).toMatchObject({
      kind: 'network',
      message: 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
      cause,
    })
  })
})

describe('mapContractError', () => {
  it('maps an invalid response without exposing validation details', () => {
    const cause = new Error('Expected data to be an object')
    const error = mapContractError(cause)

    expect(error).toMatchObject({
      kind: 'contract',
      message: 'A resposta recebida pelo serviço é inválida. Tente novamente.',
      cause,
    })
  })
})
