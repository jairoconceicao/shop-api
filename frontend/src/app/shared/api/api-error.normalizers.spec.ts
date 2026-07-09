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

  it('normalizes direct API error bodies from HttpErrorResponse', () => {
    const apiError = {
      code: 'CONFLICT',
      message: 'Ja existe um cadastro com estes dados.',
      details: {
        email: ['Email ja cadastrado'],
      },
    };

    const error = normalizeApiError(
      new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',
        error: apiError,
      }),
    );

    expect(error.status).toBe(409);
    expect(error.code).toBe('CONFLICT');
    expect(error.message).toBe('Ja existe um cadastro com estes dados.');
    expect(error.details).toEqual(apiError.details);
    expect(error.response).toEqual({ error: apiError });
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

  it('falls back to a normalized HTTP error when the body is not api-shaped', () => {
    const error = normalizeApiError(
      new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: {
          message: 'Missing resource',
        },
      }),
    );

    expect(error).toBeInstanceOf(NormalizedApiError);
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toContain('404');
    expect(error.details).toEqual({
      message: 'Missing resource',
    });
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

  it('keeps normalized errors untouched', () => {
    const normalized = new NormalizedApiError({
      status: 500,
      code: 'SERVER_ERROR',
      message: 'A API encontrou um erro interno.',
      details: null,
    });

    expect(normalizeApiError(normalized)).toBe(normalized);
  });
});
