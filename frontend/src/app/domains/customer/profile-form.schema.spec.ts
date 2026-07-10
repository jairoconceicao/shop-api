import { describe, expect, it } from 'vitest';

import {
  createEmptyProfileFormErrors,
  createEmptyProfileFormValue,
  normalizeProfileFormValue,
  profileFormSchema,
} from './profile-form.schema';

describe('profileFormSchema', () => {
  it('returns field errors for an empty profile payload', () => {
    const result = profileFormSchema.validate(createEmptyProfileFormValue());

    expect(result.success).toBe(false);
    expect(result.errors).toEqual({
      ...createEmptyProfileFormErrors(),
      cpf: ['Informe o CPF.'],
      nome: ['Informe o nome completo.'],
      dataNascimento: ['Informe a data de nascimento.'],
      email: ['Informe um e-mail valido.'],
      logradouro: ['Informe o logradouro.'],
      numero: ['Informe o numero.'],
      complemento: [],
      cep: ['Informe o CEP.'],
      bairro: ['Informe o bairro.'],
      cidade: ['Informe a cidade.'],
      uf: ['Informe a UF.'],
      ddd: ['Informe o DDD.'],
      telefone: ['Informe o telefone celular.'],
    });
  });

  it('validates cpf, email, date, uf, cep and phone rules', () => {
    const result = profileFormSchema.validate({
      cpf: '123.456.789-0a',
      nome: 'Cliente Shop',
      dataNascimento: '01-01-1990',
      email: 'cliente@shopapi',
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '123',
        complemento: 'Apto 10',
        cep: '0100-000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'sao paulo',
      },
      celular: {
        ddd: '1',
        numero: '1234567',
        whatsApp: true,
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors.cpf).toEqual(['CPF deve conter 11 digitos numericos.']);
    expect(result.errors.dataNascimento).toEqual(['Informe uma data de nascimento valida.']);
    expect(result.errors.email).toEqual(['Informe um e-mail valido.']);
    expect(result.errors.cep).toEqual(['CEP deve conter 8 digitos numericos.']);
    expect(result.errors.uf).toEqual(['UF deve ser valida.']);
    expect(result.errors.ddd).toEqual(['DDD deve conter 2 digitos numericos.']);
    expect(result.errors.telefone).toEqual(['Numero de celular deve ter no minimo 8 digitos.']);
  });

  it('normalizes values before submission', () => {
    expect(
      normalizeProfileFormValue({
        cpf: '123.456.789-01',
        nome: ' Cliente Shop ',
        dataNascimento: '1990-01-31',
        email: ' cliente@shopapi.dev ',
        endereco: {
          logradouro: ' Rua Exemplo ',
          numero: ' 123 ',
          complemento: ' Apto 10 ',
          cep: '01000-000',
          bairro: ' Centro ',
          cidade: ' Sao Paulo ',
          uf: 'sp',
        },
        celular: {
          ddd: '(11)',
          numero: '(11) 99999-9999',
          whatsApp: true,
        },
      }),
    ).toEqual({
      cpf: '12345678901',
      nome: 'Cliente Shop',
      dataNascimento: '1990-01-31',
      email: 'cliente@shopapi.dev',
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '123',
        complemento: 'Apto 10',
        cep: '01000000',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
      },
      celular: {
        ddd: '11',
        numero: '11999999999',
        whatsApp: true,
      },
    });
  });
});
