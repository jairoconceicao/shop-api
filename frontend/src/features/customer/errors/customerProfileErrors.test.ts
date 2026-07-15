import { describe, expect, it } from 'vitest'
import { AppError } from '../../../shared/errors/appError'
import { mapCustomerProfileError } from './customerProfileErrors'

describe('mapCustomerProfileError', () => {
  it('maps known nested 422 properties case-insensitively and exactly', () => {
    const error = new AppError({ kind: 'http', status: 422, message: 'Falha', details: [
      { propertyName: 'endereco.CEP', message: 'CEP inválido' },
      { propertyName: 'CELULAR.numero', message: 'Celular inválido' },
      { propertyName: 'Cpf', message: 'CPF inválido' },
    ] })
    expect(mapCustomerProfileError(error)).toEqual({ fields: [
      { field: 'cep', message: 'CEP inválido' }, { field: 'celularNumero', message: 'Celular inválido' }, { field: 'cpf', message: 'CPF inválido' },
    ], summary: [] })
  })

  it('keeps unknown or malformed details in the summary', () => {
    const error = new AppError({ kind: 'http', status: 422, message: 'Revise os dados', details: [
      { propertyName: 'Endereco.Cep.Extra', message: 'Desconhecido' }, { nope: true },
    ] })
    expect(mapCustomerProfileError(error)).toEqual({ fields: [], summary: ['Desconhecido', 'Revise os dados'] })
  })

  it.each([
    [409, 'Já existe outro cliente com estes dados.'], [404, 'Seu perfil não foi encontrado.'],
    [403, 'Você não tem permissão para atualizar estes dados.'], [500, 'O serviço está indisponível. Tente novamente.'],
  ])('provides actionable summaries for HTTP %i', (status, message) => {
    expect(mapCustomerProfileError(new AppError({ kind: 'http', status, message: 'API' })).summary).toEqual([message])
  })
})
