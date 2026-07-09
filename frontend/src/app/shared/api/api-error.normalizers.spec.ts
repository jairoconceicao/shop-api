import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { normalizeApiError } from './api-error.normalizers';
import { NormalizedApiError } from './api-error.model';

describe('API error normalizers', () => {
  it('unwraps API error envelopes from HttpErrorResponse', () => {
    const error = normalizeApiError(
      new HttpErrorResponse({
        status: 422,
        statusText: 'Unprocessable Entity',
        error: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Ha campos invalidos na requisicao.',
            details: {
              email: ['Email invalido'],
            },
          },
        },
      }),
    );

    expect(error).toBeInstanceOf(NormalizedApiError);
    expect(error.status).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Ha campos invalidos na requisicao.');
    expect(error.details).toEqual({
      email: ['Email invalido'],
    });
  });

  it('falls back to a normalized network error when the body is not shaped as API error', () => {
    const error = normalizeApiError(
      new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        error: 'fetch failed',
      }),
    );

    expect(error.status).toBe(0);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('Nao foi possivel comunicar com a API.');
    expect(error.details).toBe('fetch failed');
  });

  it('normalizes direct API error objects', () => {
    const error = normalizeApiError({
      error: {
        code: 'CONFLICT',
        message: 'Ja existe um cadastro com estes dados.',
        details: null,
      },
    });

    expect(error.status).toBe(0);
    expect(error.code).toBe('CONFLICT');
    expect(error.message).toBe('Ja existe um cadastro com estes dados.');
  });
});
